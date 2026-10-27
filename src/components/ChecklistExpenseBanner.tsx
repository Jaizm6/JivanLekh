import React from 'react';
import { Calculator, ArrowRight, Table, Sparkles, CheckCircle } from 'lucide-react';
import { parseChecklistExpenses, ExpenseSummary } from '../utils/expenseParser';

interface ChecklistExpenseBannerProps {
  bodyHtml: string;
  onConvertToTable: (summary: ExpenseSummary) => void;
}

export const ChecklistExpenseBanner: React.FC<ChecklistExpenseBannerProps> = ({
  bodyHtml,
  onConvertToTable
}) => {
  const summary = parseChecklistExpenses(bodyHtml);

  if (summary.count === 0 || summary.totalSum === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-xl shadow-2xs flex items-center justify-between flex-wrap gap-3 select-none">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Calculator size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-950">Expense Summary</span>
            <span className="text-[10px] font-medium bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded-full">
              {summary.count} items found
            </span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-700">
            TOTAL SUM: ₹{summary.totalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onConvertToTable(summary)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Table size={14} />
          <span>Convert to Expense Table</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
