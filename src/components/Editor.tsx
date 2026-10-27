import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Trash2,
  Paperclip,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag as TagIcon,
  Palette,
  Sparkles,
  Plus,
  CheckSquare,
  ChevronRight,
  Table as TableIcon
} from 'lucide-react';
import { Card, CardColor, Notebook } from '../types';
import { ChecklistExpenseBanner } from './ChecklistExpenseBanner';
import { ExpenseSummary } from '../utils/expenseParser';

interface EditorProps {
  card: Card | null;
  notebook: Notebook | null;
  onUpdateCard: (id: string, updates: Partial<Card>) => void;
  onTrashCard: (id: string) => void;
  onRestoreCard: (id: string) => void;
  onPermanentlyDeleteCard: (id: string) => void;
  onAddTag: (cardId: string, tag: string) => void;
  onRemoveTag: (cardId: string, tag: string) => void;
  onShowToast: (msg: string) => void;
  onBackToListMobile?: () => void;
}

interface SlashItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  aliases?: string[];
  action: () => void;
}

const COLOR_OPTIONS: { id: CardColor; label: string; bg: string }[] = [
  { id: 'red', label: 'Red', bg: '#ef4444' },
  { id: 'blue', label: 'Blue', bg: '#3b82f6' },
  { id: 'green', label: 'Green', bg: '#10b981' },
  { id: 'yellow', label: 'Yellow', bg: '#f59e0b' },
  { id: 'purple', label: 'Purple', bg: '#8b5cf6' },
  { id: 'gray', label: 'Gray', bg: '#6b7280' }
];

export const Editor: React.FC<EditorProps> = ({
  card,
  notebook,
  onUpdateCard,
  onTrashCard,
  onRestoreCard,
  onPermanentlyDeleteCard,
  onAddTag,
  onRemoveTag,
  onShowToast,
  onBackToListMobile
}) => {
  const [title, setTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Slash menu state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashCoords, setSlashCoords] = useState<{ top: number; left: number }>({ top: 120, left: 100 });
  const [slashSearch, setSlashSearch] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Normalizes todo items so outer div has contenteditable="false" and text is inside contenteditable="true" .todo-content span
  const normalizeEditorContent = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    // 1. Convert raw input[type="checkbox"] to .todo-line
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(input => {
      const parent = input.closest('li, p, div') as HTMLElement;
      if (parent && !parent.classList.contains('todo-line')) {
        const text = parent.textContent?.replace(/^[\s☑☐✓]+/, '').trim() || '';
        const isChecked = (input as HTMLInputElement).checked;

        const todoDiv = document.createElement('div');
        todoDiv.className = 'todo-line flex items-start gap-2.5 my-1 select-none';
        todoDiv.setAttribute('data-todo', 'true');
        if (isChecked) {
          todoDiv.setAttribute('data-checked', 'true');
          todoDiv.classList.add('checked');
        }
        todoDiv.setAttribute('contenteditable', 'false');

        const cb = document.createElement('span');
        cb.className = 'todo-check-box shrink-0 cursor-pointer select-none';
        cb.setAttribute('contenteditable', 'false');

        const contentSpan = document.createElement('span');
        contentSpan.className = 'todo-content flex-1 outline-none min-w-0 select-text';
        contentSpan.setAttribute('contenteditable', 'true');
        contentSpan.textContent = text;

        todoDiv.appendChild(cb);
        todoDiv.appendChild(contentSpan);

        parent.parentNode?.replaceChild(todoDiv, parent);
      }
    });

    // 2. Ensure all .todo-line elements have non-editable outer wrapper and editable .todo-content
    const todoLines = container.querySelectorAll('.todo-line, li:has(.todo-check-box), p:has(.todo-check-box)');
    todoLines.forEach(line => {
      const el = line as HTMLElement;
      el.setAttribute('contenteditable', 'false');
      el.classList.add('todo-line', 'flex', 'items-start', 'gap-2.5', 'my-1', 'select-none');

      let cb = el.querySelector('.todo-check-box') as HTMLElement;
      if (!cb) {
        cb = document.createElement('span');
        cb.className = 'todo-check-box shrink-0 cursor-pointer select-none';
        cb.setAttribute('contenteditable', 'false');
        el.insertBefore(cb, el.firstChild);
      } else {
        cb.setAttribute('contenteditable', 'false');
      }

      let contentSpan = el.querySelector('.todo-content') as HTMLElement;
      if (!contentSpan) {
        contentSpan = document.createElement('span');
        contentSpan.className = 'todo-content flex-1 outline-none min-w-0 select-text';
        contentSpan.setAttribute('contenteditable', 'true');

        const nodesToMove: Node[] = [];
        el.childNodes.forEach(child => {
          if (child !== cb && !child.parentElement?.classList.contains('todo-check-box')) {
            nodesToMove.push(child);
          }
        });
        nodesToMove.forEach(n => contentSpan.appendChild(n));
        el.appendChild(contentSpan);
      } else {
        contentSpan.setAttribute('contenteditable', 'true');
        contentSpan.classList.add('todo-content', 'flex-1', 'outline-none', 'min-w-0', 'select-text');
      }
    });
  }, []);

  // Sync state when active card changes
  useEffect(() => {
    if (!card) return;
    setTitle(card.title);

    if (bodyRef.current && bodyRef.current.innerHTML !== card.body) {
      bodyRef.current.innerHTML = card.body || '<p><br></p>';
      normalizeEditorContent(bodyRef.current);
    }

    if (!card.title && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [card?.id, normalizeEditorContent]);

  // Debounced auto-save handler (500ms)
  const triggerDebouncedSave = useCallback(
    (newTitle: string, newBody: string) => {
      if (!card) return;
      setSaveStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        onUpdateCard(card.id, { title: newTitle, body: newBody });
        setSaveStatus('saved');
      }, 500);
    },
    [card, onUpdateCard]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const bodyContent = bodyRef.current?.innerHTML || '';
    triggerDebouncedSave(val, bodyContent);
  };

  const recalculateNotionTables = () => {
    if (!bodyRef.current) return;
    const tables = bodyRef.current.querySelectorAll('table.notion-db-table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      let sum = 0;
      let count = 0;
      rows.forEach(r => {
        const cells = r.querySelectorAll('td');
        if (cells.length >= 2) {
          const val = parseFloat((cells[1].innerText || cells[1].textContent || '').replace(/[^0-9\.]/g, ''));
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        }
      });
      const tfoot = table.querySelector('tfoot');
      if (tfoot) {
        const countTd = tfoot.querySelector('td:nth-child(1)');
        const sumTd = tfoot.querySelector('td:nth-child(2)');
        if (countTd) countTd.textContent = `COUNT ${count}`;
        if (sumTd) sumTd.textContent = `SUM ₹${sum.toFixed(2)}`;
      }
    });
  };

  const handleBodyInput = () => {
    if (!card || !bodyRef.current) return;
    recalculateNotionTables();
    normalizeEditorContent(bodyRef.current);
    const currentHtml = bodyRef.current.innerHTML;
    triggerDebouncedSave(title, currentHtml);
    checkSlashTrigger();
  };

  const focusElementContent = (el: HTMLElement, atStart = false) => {
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    if (el.childNodes.length > 0) {
      const target = el.lastChild || el;
      if (target.nodeType === Node.TEXT_NODE) {
        const len = atStart ? 0 : (target.textContent?.length || 0);
        range.setStart(target, len);
        range.setEnd(target, len);
      } else {
        range.selectNodeContents(el);
        range.collapse(!atStart);
      }
    } else {
      range.setStart(el, 0);
      range.collapse(true);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target) {
      if (target.classList.contains('todo-check-box')) {
        const line = target.closest('.todo-line') as HTMLElement;
        if (line) {
          const isChecked = line.getAttribute('data-checked') === 'true' || line.classList.contains('checked');
          if (isChecked) {
            line.removeAttribute('data-checked');
            line.classList.remove('checked');
          } else {
            line.setAttribute('data-checked', 'true');
            line.classList.add('checked');
          }
          handleBodyInput();
        }
        return;
      }

      const line = target.closest('.todo-line') as HTMLElement;
      if (line) {
        const content = line.querySelector('.todo-content') as HTMLElement;
        if (content && target !== content && !content.contains(target)) {
          focusElementContent(content);
        }
        return;
      }
    }
  };

  const insertTodoLine = (text = '', targetBlock?: HTMLElement | null) => {
    const sel = window.getSelection();
    let parentBlock: HTMLElement | null = targetBlock || null;

    if (!parentBlock && sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      while (node && node.parentElement !== bodyRef.current && node !== bodyRef.current) {
        node = node.parentElement;
      }
      if (node && node !== bodyRef.current) {
        parentBlock = node as HTMLElement;
      }
    }

    const todoDiv = document.createElement('div');
    todoDiv.className = 'todo-line flex items-start gap-2.5 my-1 select-none';
    todoDiv.setAttribute('data-todo', 'true');
    todoDiv.setAttribute('contenteditable', 'false');

    const checkboxSpan = document.createElement('span');
    checkboxSpan.className = 'todo-check-box shrink-0 cursor-pointer select-none';
    checkboxSpan.setAttribute('contenteditable', 'false');

    const contentSpan = document.createElement('span');
    contentSpan.className = 'todo-content flex-1 outline-none min-w-0 select-text';
    contentSpan.setAttribute('contenteditable', 'true');
    contentSpan.textContent = text;

    todoDiv.appendChild(checkboxSpan);
    todoDiv.appendChild(contentSpan);

    if (parentBlock && parentBlock.parentNode) {
      const parentText = parentBlock.textContent?.replace(/[\/\s\u200B]+/g, '').trim() || '';
      if (parentText === '' || parentText === 'todo' || parentText === 'to-do' || parentText === text) {
        parentBlock.parentNode.replaceChild(todoDiv, parentBlock);
      } else {
        parentBlock.parentNode.insertBefore(todoDiv, parentBlock.nextSibling);
      }
    } else {
      bodyRef.current?.appendChild(todoDiv);
    }

    focusElementContent(contentSpan);
    handleBodyInput();
  };

  // Execute standard formatting commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    bodyRef.current?.focus();
    handleBodyInput();
  };

  const insertExpenseTableHtml = (
    customItems?: Array<{ name: string; amount: number; category: string; person: string; status: string }>,
    targetBlock?: HTMLElement | null
  ) => {
    const list = customItems && customItems.length > 0 ? customItems : [
      { name: 'Site Visit Local', amount: 20.00, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
      { name: 'Coffee & Snacks', amount: 20.00, category: 'Food & Grocery', person: 'Jaiprakash', status: 'Settled' },
      { name: 'Auto fare', amount: 15.00, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' }
    ];

    let rowsHtml = '';
    let total = 0;
    list.forEach(i => {
      total += i.amount;
      rowsHtml += `<tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">${i.name}</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">${i.amount.toFixed(2)}</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">${i.category}</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">${i.person}</td><td style="padding:6px 10px;" contenteditable="true">${i.status}</td></tr>`;
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'notion-db-block my-4';
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.style.cssText = 'border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#ffffff;';
    wrapper.innerHTML = `<div style="padding:8px 12px;background:#F8F9FA;border-bottom:1px solid #E5E7EB;font-weight:600;font-size:12px;color:#374151;display:flex;align-items:center;justify-between;"><span>📊 Notion Expense Database Table</span><span style="font-size:10px;color:#6B7280;font-weight:normal;">Auto-calculates totals</span></div><table class="notion-db-table" style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;"><thead><tr style="background:#F3F4F6;border-bottom:1px solid #E5E7EB;color:#6B7280;font-size:11px;"><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">Aa Name</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">₹ Amount</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">🏷️ Category</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">👤 Person</th><th style="padding:8px 10px;">Status</th></tr></thead><tbody>${rowsHtml}</tbody><tfoot><tr style="background:#F8F9FA;border-top:2px solid #D1D5DB;font-weight:700;color:#1F2937;"><td style="padding:8px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#6B7280;">COUNT ${list.length}</td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-size:13px;">SUM ₹${total.toFixed(2)}</td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;"></td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;"></td><td style="padding:8px 10px;"></td></tr></tfoot></table>`;

    const trailingP = document.createElement('p');
    trailingP.innerHTML = '<br>';

    const sel = window.getSelection();
    let parentBlock: HTMLElement | null = targetBlock || null;

    if (!parentBlock && sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      while (node && node.parentElement !== bodyRef.current && node !== bodyRef.current) {
        node = node.parentElement;
      }
      if (node && node !== bodyRef.current) {
        parentBlock = node as HTMLElement;
      }
    }

    if (parentBlock && parentBlock.parentNode) {
      const text = parentBlock.textContent?.trim() || '';
      if (text === '' || text.startsWith('/') || text === 'table' || text === 'database') {
        parentBlock.parentNode.replaceChild(wrapper, parentBlock);
      } else {
        parentBlock.parentNode.insertBefore(wrapper, parentBlock.nextSibling);
      }
    } else {
      bodyRef.current?.appendChild(wrapper);
    }

    if (wrapper.nextSibling) {
      wrapper.parentNode?.insertBefore(trailingP, wrapper.nextSibling);
    } else {
      wrapper.parentNode?.appendChild(trailingP);
    }

    focusElementContent(trailingP);
    handleBodyInput();
  };

  const handleConvertChecklistToTable = (summary: ExpenseSummary) => {
    insertExpenseTableHtml(summary.items);
    onShowToast(`Converted ${summary.count} expenses to Notion Table (Total: ₹${summary.totalSum.toFixed(2)})`);
  };

  const updateSlashCoordinates = (range: Range) => {
    let top = 0;
    let left = 0;
    const rect = range.getBoundingClientRect();

    if (rect && rect.bottom > 0) {
      top = rect.bottom + 6;
      left = rect.left;
    } else {
      const parent = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
      if (parent) {
        const pRect = parent.getBoundingClientRect();
        top = pRect.bottom + 6;
        left = pRect.left;
      }
    }

    if (!top && bodyRef.current) {
      const bRect = bodyRef.current.getBoundingClientRect();
      top = bRect.top + 40;
      left = bRect.left + 24;
    }

    top = Math.max(70, Math.min(top, window.innerHeight - 300));
    left = Math.max(16, Math.min(left, window.innerWidth - 270));

    setSlashCoords({ top, left });
  };

  const checkSlashTrigger = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    const text = textNode.textContent || '';
    const offset = range.startOffset;

    const beforeCaret = text.slice(0, offset);
    const match = beforeCaret.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

    if (match) {
      savedRangeRef.current = range.cloneRange();
      setSlashSearch(match[1]);
      setSlashIndex(0);
      updateSlashCoordinates(range);
      setShowSlashMenu(true);
    } else if (showSlashMenu) {
      if (!beforeCaret.includes('/')) {
        setShowSlashMenu(false);
      }
    }
  };

  const slashItems: SlashItem[] = [
    {
      id: 'table',
      title: 'Expense & Data Table',
      subtitle: 'Notion database with automatic SUM and COUNT totals',
      icon: <TableIcon size={15} className="text-emerald-600" />,
      aliases: ['table', 'database', 'db', 'expense', 'grid', 'calc', 'sum'],
      action: () => insertExpenseTableHtml()
    },
    {
      id: 'todo',
      title: 'To-do List',
      subtitle: 'Track tasks with a Notion checkbox',
      icon: <CheckSquare size={15} className="text-blue-600" />,
      aliases: ['todo', 'to-do', 'task', 'checklist', 'check', 'list'],
      action: () => insertTodoLine()
    },
    {
      id: 'h1',
      title: 'Heading 1',
      subtitle: 'Big section heading',
      icon: <Heading1 size={15} className="text-blue-600" />,
      action: () => execCmd('formatBlock', '<h1>')
    },
    {
      id: 'h2',
      title: 'Heading 2',
      subtitle: 'Medium section heading',
      icon: <Heading2 size={15} className="text-indigo-600" />,
      action: () => execCmd('formatBlock', '<h2>')
    },
    {
      id: 'h3',
      title: 'Heading 3',
      subtitle: 'Small subsection heading',
      icon: <Heading3 size={15} className="text-purple-600" />,
      action: () => execCmd('formatBlock', '<h3>')
    },
    {
      id: 'ul',
      title: 'Bulleted List',
      subtitle: 'Create a simple bulleted list',
      icon: <List size={15} className="text-emerald-600" />,
      action: () => execCmd('insertUnorderedList')
    },
    {
      id: 'ol',
      title: 'Numbered List',
      subtitle: 'Create a numbered sequential list',
      icon: <ListOrdered size={15} className="text-amber-600" />,
      action: () => execCmd('insertOrderedList')
    },
    {
      id: 'callout',
      title: 'Callout',
      subtitle: 'Highlight important info with an icon',
      icon: <Sparkles size={15} className="text-amber-500" />,
      action: () => {
        execCmd('insertHTML', '<div class="callout-block"><span style="font-size:18px;">💡</span><div>Type callout text here...</div></div><p><br></p>');
      }
    },
    {
      id: 'toggle',
      title: 'Toggle List',
      subtitle: 'Collapse and expand details',
      icon: <ChevronRight size={15} className="text-purple-600" />,
      action: () => {
        execCmd('insertHTML', '<details class="toggle-block"><summary>Toggle title</summary><p>Hidden content details...</p></details><p><br></p>');
      }
    },
    {
      id: 'quote',
      title: 'Quote',
      subtitle: 'Capture a meaningful citation',
      icon: <Quote size={15} className="text-blue-500" />,
      action: () => execCmd('formatBlock', '<blockquote>')
    },
    {
      id: 'code',
      title: 'Code Block',
      subtitle: 'Preformatted code block',
      icon: <Code size={15} className="text-rose-500" />,
      action: () => {
        execCmd('insertHTML', '<pre><code>// Write code here</code></pre><p><br></p>');
      }
    },
    {
      id: 'divider',
      title: 'Divider',
      subtitle: 'Visually separate content with a line',
      icon: <Minus size={15} className="text-gray-500" />,
      action: () => execCmd('insertHorizontalRule')
    },
    {
      id: 'image',
      title: 'Image URL',
      subtitle: 'Embed an image from a link',
      icon: <ImageIcon size={15} className="text-teal-600" />,
      action: () => {
        const url = window.prompt('Enter image URL (https://...):');
        if (url && url.startsWith('http')) {
          execCmd('insertImage', url);
        }
      }
    }
  ];

  const filteredSlashItems = slashItems.filter(item => {
    const q = slashSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.aliases && item.aliases.some(a => a.toLowerCase().includes(q)))
    );
  });

  const applySlashAction = (item: SlashItem) => {
    setShowSlashMenu(false);

    const sel = window.getSelection();
    let currentBlock: HTMLElement | null = null;

    if (savedRangeRef.current) {
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let node: Node | null = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const slashIdx = text.lastIndexOf('/');
        if (slashIdx !== -1) {
          node.textContent = text.substring(0, slashIdx);
        }
        node = node.parentElement;
      }
      while (node && node.parentElement !== bodyRef.current && node !== bodyRef.current) {
        node = node.parentElement;
      }
      if (node && node !== bodyRef.current) {
        currentBlock = node as HTMLElement;
      }
    }

    bodyRef.current?.focus();

    if (item.id === 'table') {
      insertExpenseTableHtml(undefined, currentBlock);
    } else if (item.id === 'todo') {
      insertTodoLine('', currentBlock);
    } else {
      item.action();
    }
  };

  const handleBodyKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex(prev => (prev + 1) % Math.max(1, filteredSlashItems.length));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex(prev => (prev - 1 + filteredSlashItems.length) % Math.max(1, filteredSlashItems.length));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSlashItems[slashIndex]) {
          applySlashAction(filteredSlashItems[slashIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
        return;
      }
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode;
      const todoLine = node
        ? node instanceof HTMLElement
          ? node.closest('.todo-line')
          : node.parentElement?.closest('.todo-line')
        : null;

      if (todoLine) {
        const contentSpan = (todoLine.querySelector('.todo-content') || todoLine) as HTMLElement;

        if (e.key === 'Enter') {
          e.preventDefault();
          const text = contentSpan.textContent?.trim() || '';

          if (text === '') {
            // Empty todo -> convert to paragraph
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            todoLine.parentNode?.replaceChild(p, todoLine);
            focusElementContent(p);
            handleBodyInput();
          } else {
            // Non-empty todo -> create new todo line below
            const newTodo = document.createElement('div');
            newTodo.className = 'todo-line flex items-start gap-2.5 my-1 select-none';
            newTodo.setAttribute('data-todo', 'true');
            newTodo.setAttribute('contenteditable', 'false');

            const checkboxSpan = document.createElement('span');
            checkboxSpan.className = 'todo-check-box shrink-0 cursor-pointer select-none';
            checkboxSpan.setAttribute('contenteditable', 'false');

            const newContentSpan = document.createElement('span');
            newContentSpan.className = 'todo-content flex-1 outline-none min-w-0 select-text';
            newContentSpan.setAttribute('contenteditable', 'true');

            newTodo.appendChild(checkboxSpan);
            newTodo.appendChild(newContentSpan);

            if (todoLine.nextSibling) {
              todoLine.parentNode?.insertBefore(newTodo, todoLine.nextSibling);
            } else {
              todoLine.parentNode?.appendChild(newTodo);
            }

            focusElementContent(newContentSpan);
            handleBodyInput();
          }
          return;
        }

        if (e.key === 'Backspace') {
          const text = contentSpan.textContent || '';
          if (text === '' || sel.anchorOffset === 0) {
            e.preventDefault();
            const p = document.createElement('p');
            p.textContent = text;
            if (!text) p.innerHTML = '<br>';
            todoLine.parentNode?.replaceChild(p, todoLine);
            focusElementContent(p);
            handleBodyInput();
            return;
          }
        }
      }
    }
  };

  const openSlashMenuManually = () => {
    bodyRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      updateSlashCoordinates(savedRangeRef.current);
    } else if (bodyRef.current) {
      const bRect = bodyRef.current.getBoundingClientRect();
      setSlashCoords({ top: bRect.top + 50, left: bRect.left + 30 });
    }
    setSlashSearch('');
    setSlashIndex(0);
    setShowSlashMenu(true);
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (card && newTagInput.trim()) {
      onAddTag(card.id, newTagInput.trim());
      setNewTagInput('');
    }
  };

  const getStats = () => {
    if (!bodyRef.current) return { words: 0, chars: 0 };
    const text = bodyRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  };

  const { words, chars } = getStats();

  if (!card) {
    return (
      <main className="h-full flex-1 flex flex-col items-center justify-center p-8 bg-[#FFFFFF] text-center text-gray-400">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200/60 flex items-center justify-center text-gray-400 mb-4 shadow-2xs">
          <Palette size={26} strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-[#1F2937] mb-1">No note selected</h3>
        <p className="text-xs text-[#6B7280] max-w-xs">
          Choose a note from the list, or create a new card to start capturing your thoughts.
        </p>
      </main>
    );
  }

  return (
    <main className="h-full flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center justify-between gap-3 bg-[#FFFFFF] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToListMobile && (
            <button
              onClick={onBackToListMobile}
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              aria-label="Back to notes"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {notebook && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: notebook.color || '#3b82f6' }}
              />
              <span className="truncate">{notebook.name}</span>
            </div>
          )}

          <span className="text-[11px] text-gray-400">·</span>
          <span className="text-[11px] text-gray-400">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        </div>

        {/* Actions & Color Picker */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openSlashMenuManually}
            title="Insert Block (/ commands)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 bg-blue-50/80 hover:bg-blue-100 font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            <span>Blocks</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Card Color"
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <Palette size={16} />
              {card.colorLabel && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLOR_OPTIONS.find(c => c.id === card.colorLabel)?.bg }}
                />
              )}
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-10 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-2 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onUpdateCard(card.id, { colorLabel: null });
                    setShowColorPicker(false);
                  }}
                  title="No color"
                  className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 hover:bg-gray-100"
                >
                  /
                </button>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onUpdateCard(card.id, { colorLabel: c.id });
                      setShowColorPicker(false);
                    }}
                    title={c.label}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      card.colorLabel === c.id ? 'scale-125 ring-2 ring-blue-400 ring-offset-1' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.bg }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onShowToast('Upload feature coming soon (use /image for image URLs)')}
            title="Attach file or image"
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip size={16} />
          </button>

          {card.isTrashed ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRestoreCard(card.id)}
                className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Permanently delete this note?')) {
                    onPermanentlyDeleteCard(card.id);
                  }
                }}
                className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
              >
                Delete Forever
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTrashCard(card.id)}
              title="Move to Trash"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-10 px-4 border-b border-[#E5E7EB] flex items-center gap-0.5 overflow-x-auto bg-[#FAFAFB] shrink-0 text-gray-600 select-none">
        <button
          onClick={() => execCmd('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => execCmd('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => execCmd('underline')}
          title="Underline (Ctrl+U)"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Underline size={14} />
        </button>
        <button
          onClick={() => execCmd('strikeThrough')}
          title="Strikethrough"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Strikethrough size={14} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1.5" />
        <button
          onClick={() => execCmd('formatBlock', '<h1>')}
          title="Heading 1"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded font-bold text-xs"
        >
          H1
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<h2>')}
          title="Heading 2"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded font-bold text-xs"
        >
          H2
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<h3>')}
          title="Heading 3"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded font-bold text-xs"
        >
          H3
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1.5" />
        <button
          onClick={() => insertExpenseTableHtml()}
          title="Insert Expense Database Table (with SUM)"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded text-emerald-600"
        >
          <TableIcon size={14} />
        </button>
        <button
          onClick={() => insertTodoLine()}
          title="To-do / Checklist"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded text-blue-600"
        >
          <CheckSquare size={14} />
        </button>
        <button
          onClick={() => execCmd('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <List size={14} />
        </button>
        <button
          onClick={() => execCmd('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <ListOrdered size={14} />
        </button>
        <button
          onClick={() => execCmd('formatBlock', '<blockquote>')}
          title="Quote"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Quote size={14} />
        </button>
        <button
          onClick={() => execCmd('insertHTML', '<pre><code>// Enter code here</code></pre><p><br></p>')}
          title="Code Block"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Code size={14} />
        </button>
        <button
          onClick={() => execCmd('insertHorizontalRule')}
          title="Divider"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL (https://...):');
            if (url) execCmd('createLink', url);
          }}
          title="Insert Link"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <LinkIcon size={14} />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) execCmd('insertImage', url);
          }}
          title="Insert Image"
          className="p-1.5 hover:bg-gray-200/70 hover:text-gray-900 rounded"
        >
          <ImageIcon size={14} />
        </button>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-16 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Note Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            disabled={card.isTrashed}
            className="w-full text-2xl md:text-3xl font-serif font-bold text-[#1F2937] placeholder-gray-300 border-none outline-none mb-4 tracking-tight leading-tight bg-transparent"
          />

          {/* Tags Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <TagIcon size={13} />
            </div>

            {card.tags &&
              card.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200/80 px-2 py-0.5 rounded-md transition-colors"
                >
                  <span>#{tag}</span>
                </span>
              ))}

            {!card.isTrashed && (
              <form onSubmit={handleAddTagSubmit} className="inline-block">
                <input
                  type="text"
                  placeholder="+ Add tag..."
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  className="text-xs text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none py-0.5 px-1 w-20 focus:w-28 transition-all"
                />
              </form>
            )}
          </div>

          {/* Automatic Expense Summary Banner for Checklist Expenses */}
          <ChecklistExpenseBanner
            bodyHtml={card.body}
            onConvertToTable={handleConvertChecklistToTable}
          />

          {/* Rich Text Editor Body */}
          <div
            ref={bodyRef}
            contentEditable={!card.isTrashed}
            suppressContentEditableWarning
            onInput={handleBodyInput}
            onClick={handleBodyClick}
            onKeyUp={checkSlashTrigger}
            onKeyDown={handleBodyKeyDown}
            data-placeholder="Start typing your thoughts, or type '/' for Notion-style blocks..."
            className="editor-body outline-none min-h-[50vh] text-[#1F2937] text-base leading-[1.65] font-sans selection:bg-blue-100 selection:text-blue-900"
          />
        </div>
      </div>

      {/* Floating Notion Slash Command Menu */}
      {showSlashMenu && (
        <div
          onMouseDown={e => e.preventDefault()}
          style={{ top: slashCoords.top, left: slashCoords.left }}
          className="fixed z-50 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-2xl overflow-hidden py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex items-center justify-between">
            <span>Notion Blocks</span>
            {slashSearch && <span className="font-mono text-blue-500">/{slashSearch}</span>}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredSlashItems.length === 0 ? (
              <div className="px-3 py-3 text-center text-gray-400 italic">No matching blocks</div>
            ) : (
              filteredSlashItems.map((item, index) => (
                <button
                  key={item.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applySlashAction(item)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
                    index === slashIndex
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="p-1.5 rounded-lg bg-gray-100 text-gray-600 shadow-2xs">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-none mb-0.5 truncate">{item.title}</div>
                    <div className="text-[10px] text-gray-400 font-normal leading-none truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom stats footer */}
      <footer className="h-8 px-4 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280] bg-[#FAFBFB] shrink-0">
        <div className="flex items-center gap-3">
          <span>{words} words</span>
          <span>·</span>
          <span>{chars} characters</span>
          <span>·</span>
          <span>{Math.max(1, Math.round(words / 200))} min read</span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
          <span>Type</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px]">
            /
          </kbd>
          <span>or click</span>
          <button
            onClick={openSlashMenuManually}
            className="text-blue-600 hover:underline font-medium"
          >
            + Blocks
          </button>
        </div>
      </footer>
    </main>
  );
};
