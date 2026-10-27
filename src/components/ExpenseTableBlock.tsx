import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calculator, Download, Table, CheckCircle2, Clock } from 'lucide-react';
import { ExpenseItem } from '../utils/expenseParser';

interface ExpenseTableBlockProps {
  initialItems?: ExpenseItem[];
  title?: string;
  onChange?: (items: ExpenseItem[], totalSum: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Transportation': 'bg-blue-50 text-blue-700 border-blue-200',
  'Food & Grocery': 'bg-amber-50 text-amber-700 border-amber-200',
  'Bills & Utilities': 'bg-purple-50 text-purple-700 border-purple-200',
  'Housing Expense': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Site Visit Expense': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Entertainment': 'bg-pink-50 text-pink-700 border-pink-200',
  'Other': 'bg-gray-50 text-gray-700 border-gray-200'
};

const DEFAULT_ITEMS: ExpenseItem[] = [
  { id: '1', name: 'Local up', amount: 20, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
  { id: '2', name: 'Local Down', amount: 20, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
  { id: '3', name: 'Metro down', amount: 30, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
  { id: '4', name: 'Auto up', amount: 15, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
  { id: '5', name: 'Auto down', amount: 15, category: 'Transportation', person: 'Jaiprakash', status: 'Settled' },
  { id: '6', name: 'Coffee & Snacks', amount: 20, category: 'Food & Grocery', person: 'Jaiprakash', status: 'Settled' }
];

export const ExpenseTableBlock: React.FC<ExpenseTableBlockProps> = ({
  initialItems,
  title = 'Site Visit Expense Log',
  onChange
}) => {
  const [items, setItems] = useState<ExpenseItem[]>(() => {
    return initialItems && initialItems.length > 0 ? initialItems : DEFAULT_ITEMS;
  });

  const totalSum = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [items]);

  useEffect(() => {
    if (onChange) {
      onChange(items, totalSum);
    }
  }, [items, totalSum, onChange]);

  const handleUpdateItem = (id: string, field: keyof ExpenseItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'amount' ? parseFloat(value) || 0 : value
          };
        }
        return item;
      })
    );
  };

  const handleAddRow = () => {
    const newItem: ExpenseItem = {
      id: `exp-${Math.random().toString(36).slice(2, 8)}`,
      name: 'New Site Expense',
      amount: 0,
      category: 'Site Visit Expense',
      person: 'Jaiprakash',
      status: 'Pending'
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleDeleteRow = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Amount (INR)', 'Category', 'Person', 'Status'];
    const rows = items.map(i => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.amount,
      `"${i.category}"`,
      `"${i.person}"`,
      `"${i.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="my-6 border border-[#E5E7EB] rounded-xl shadow-xs bg-white overflow-hidden select-none">
      {/* Table Header */}
      <div className="px-4 py-3 bg-[#FAFBFB] border-b border-[#E5E7EB] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <Table size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#1F2937] flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] font-normal text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">
                Notion Database
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Plus size={13} />
            <span>Add Row</span>
          </button>
          <button
            onClick={handleExportCSV}
            title="Export Table as CSV"
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#6B7280] font-semibold text-[11px] tracking-tight">
              <th className="py-2.5 px-3 min-w-[180px] border-r border-[#E5E7EB]">Aa Name</th>
              <th className="py-2.5 px-3 min-w-[120px] border-r border-[#E5E7EB]">₹ Amount</th>
              <th className="py-2.5 px-3 min-w-[140px] border-r border-[#E5E7EB]">🏷️ Category</th>
              <th className="py-2.5 px-3 min-w-[120px] border-r border-[#E5E7EB]">👤 Person</th>
              <th className="py-2.5 px-3 min-w-[120px] border-r border-[#E5E7EB]">Status</th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937]">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                {/* Name */}
                <td className="py-1.5 px-3 border-r border-[#E5E7EB]">
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="Expense item..."
                    className="w-full bg-transparent outline-none border-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 text-xs font-medium text-gray-800"
                  />
                </td>

                {/* Amount */}
                <td className="py-1.5 px-3 border-r border-[#E5E7EB]">
                  <div className="flex items-center gap-1 font-mono font-medium text-emerald-700">
                    <span>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount || ''}
                      onChange={e => handleUpdateItem(item.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent outline-none border-none focus:ring-1 focus:ring-emerald-400 rounded px-1 py-0.5 text-xs font-mono font-semibold"
                    />
                  </div>
                </td>

                {/* Category */}
                <td className="py-1.5 px-3 border-r border-[#E5E7EB]">
                  <select
                    value={item.category}
                    onChange={e => handleUpdateItem(item.id, 'category', e.target.value)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border outline-none cursor-pointer ${
                      CATEGORY_COLORS[item.category] || 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Food & Grocery">Food & Grocery</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Housing Expense">Housing Expense</option>
                    <option value="Site Visit Expense">Site Visit Expense</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </td>

                {/* Person */}
                <td className="py-1.5 px-3 border-r border-[#E5E7EB]">
                  <input
                    type="text"
                    value={item.person}
                    onChange={e => handleUpdateItem(item.id, 'person', e.target.value)}
                    className="w-full bg-transparent outline-none border-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 text-xs text-gray-600"
                  />
                </td>

                {/* Status */}
                <td className="py-1.5 px-3 border-r border-[#E5E7EB]">
                  <select
                    value={item.status}
                    onChange={e => handleUpdateItem(item.id, 'status', e.target.value)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200 bg-white text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="Settled">🟢 Settled</option>
                    <option value="Great Job">🟢 Great Job</option>
                    <option value="Stayed on budget">🔵 Stayed on budget</option>
                    <option value="Pending">🟡 Pending</option>
                  </select>
                </td>

                {/* Delete button */}
                <td className="py-1.5 px-2 text-center">
                  <button
                    onClick={() => handleDeleteRow(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Table Summary Footer Row (Matching ss1) */}
          <tfoot>
            <tr className="bg-[#F8F9FA] border-t-2 border-[#D1D5DB] text-xs font-semibold text-[#1F2937]">
              <td className="py-2.5 px-3 border-r border-[#E5E7EB] text-gray-500 font-mono">
                COUNT {items.length}
              </td>
              <td className="py-2.5 px-3 border-r border-[#E5E7EB] font-mono text-emerald-700 font-bold text-sm">
                SUM ₹{totalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2.5 px-3 border-r border-[#E5E7EB] font-mono text-gray-500 text-[11px]">
                AVG ₹{items.length > 0 ? (totalSum / items.length).toFixed(2) : '0.00'}
              </td>
              <td className="py-2.5 px-3 border-r border-[#E5E7EB]"></td>
              <td className="py-2.5 px-3 border-r border-[#E5E7EB]"></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
