export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  person: string;
  status: string;
}

export interface ExpenseSummary {
  items: ExpenseItem[];
  totalSum: number;
  count: number;
}

/**
 * Parses text/HTML content (such as checklist notes like "20₹ - Local up" or "Local up - 20")
 * and extracts all expense entries and amounts.
 */
export function parseChecklistExpenses(htmlOrText: string): ExpenseSummary {
  if (!htmlOrText) {
    return { items: [], totalSum: 0, count: 0 };
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlOrText;

  // Exclude already-inserted Notion expense tables so we don't double-count their rows or SUM footer
  tempDiv.querySelectorAll('.notion-db-block, table').forEach(el => el.remove());

  // Track which lines came from todo items
  const todoTexts = new Set<string>();
  tempDiv.querySelectorAll('.todo-line, .todo-content, li').forEach(el => {
    const t = (el.textContent || '').trim();
    if (t) todoTexts.add(t);
  });

  // Detached elements don't generate \n on innerText; explicitly insert line breaks for block tags & <br>
  tempDiv.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  tempDiv
    .querySelectorAll('div, p, li, h1, h2, h3, h4, h5, h6, blockquote, .todo-line')
    .forEach(el => {
      el.prepend(document.createTextNode('\n'));
      el.append(document.createTextNode('\n'));
    });

  const lines = (tempDiv.textContent || '')
    .split('\n')
    .map(l => l.replace(/\u200B/g, '').trim())
    .filter(Boolean);

  const items: ExpenseItem[] = [];
  let totalSum = 0;

  lines.forEach((line, idx) => {
    // Strip leading checkbox symbols/bullets, and numbered list prefixes like "1. " only if another number follows
    const cleanLine = line
      .replace(/^[☑☐✓✔✕✖•\-\*\+\s]+/, '')
      .replace(/^\d+[\.\)]\s+(?=.*\d)/, '')
      .trim();

    if (!cleanLine || !/\d/.test(cleanLine)) return;

    const hasCurrency = /(?:₹|\$|\brs\.?\b|\binr\b|\/-)/i.test(cleanLine);
    const hasSeparator = /[-:–—=]/.test(cleanLine);
    const isTodoLine = todoTexts.has(line) || todoTexts.has(cleanLine);

    if (!hasCurrency && !hasSeparator && !isTodoLine) return;

    let amount = NaN;
    let name = '';

    // Pattern 1: Amount at start -> e.g. "20₹ - Local up", "₹20 Local up", "20 - Local up", "Rs. 150 - Cab"
    const startMatch = cleanLine.match(
      /^(?:(?:₹|\$|rs\.?|inr)\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:₹|\$|rs\.?|inr|\/-)?\s*(?:[-:–—=]\s*|\s+)(.+)$/i
    );

    // Pattern 2: Amount at end -> e.g. "Local up - 20₹", "Local up - 20", "Local up 20₹", "Auto 15"
    const endMatch = cleanLine.match(
      /^(.+?)\s*(?:[-:–—=]\s*|\s+)(?:(?:₹|\$|rs\.?|inr)\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:₹|\$|rs\.?|inr|\/-)?$/i
    );

    // Pattern 3: Standalone amount with currency -> e.g. "20₹" or "₹50"
    const soloMatch = cleanLine.match(
      /^(?:(?:₹|\$|rs\.?|inr)\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:₹|\$|rs\.?|inr|\/-)$/i
    );

    if (startMatch && !/^\d+$/.test(startMatch[2].trim())) {
      amount = parseFloat(startMatch[1].replace(/,/g, ''));
      name = startMatch[2].replace(/^[-:–—=\s]+/, '').trim();
    } else if (endMatch) {
      amount = parseFloat(endMatch[2].replace(/,/g, ''));
      name = endMatch[1].replace(/[-:–—=\s]+$/, '').trim();
    } else if (soloMatch && hasCurrency) {
      amount = parseFloat(soloMatch[1].replace(/,/g, ''));
      name = `Expense ${idx + 1}`;
    }

    if (!isNaN(amount) && amount > 0) {
      const cleanName = name || `Expense ${idx + 1}`;
      items.push({
        id: `exp-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: cleanName,
        amount,
        category: guessCategory(cleanName),
        person: 'You',
        status: 'Logged'
      });

      totalSum += amount;
    }
  });

  return {
    items,
    totalSum: Math.round(totalSum * 100) / 100,
    count: items.length
  };
}

function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes('local') ||
    lower.includes('metro') ||
    lower.includes('auto') ||
    lower.includes('cab') ||
    lower.includes('bus') ||
    lower.includes('train') ||
    lower.includes('travel') ||
    lower.includes('fuel')
  ) {
    return 'Transportation';
  }
  if (
    lower.includes('coffee') ||
    lower.includes('tea') ||
    lower.includes('lunch') ||
    lower.includes('dinner') ||
    lower.includes('breakfast') ||
    lower.includes('food') ||
    lower.includes('snack') ||
    lower.includes('water')
  ) {
    return 'Food & Grocery';
  }
  if (
    lower.includes('recharge') ||
    lower.includes('wifi') ||
    lower.includes('phone') ||
    lower.includes('bill')
  ) {
    return 'Bills & Utilities';
  }
  if (lower.includes('stay') || lower.includes('hotel') || lower.includes('rent')) {
    return 'Housing Expense';
  }
  return 'Site Visit Expense';
}
