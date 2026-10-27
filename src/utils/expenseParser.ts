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
 * Parses text/HTML content (such as checklist notes like "20₹ - Local up")
 * and extracts all expense entries and amounts.
 */
export function parseChecklistExpenses(htmlOrText: string): ExpenseSummary {
  // Strip HTML tags to process clean lines
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlOrText;
  const lines = (tempDiv.innerText || tempDiv.textContent || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const items: ExpenseItem[] = [];
  let totalSum = 0;

  // Regex patterns for currency like 20₹, ₹20, 20 Rs, Rs 20, $20, 20.50₹, etc.
  const regexes = [
    // 20₹ - Local up  OR  20.50 ₹ Local up
    /([₹$]|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)\s*([₹$]|rs\.?|inr)?\s*[-:\s]?\s*(.*)/i
  ];

  lines.forEach((line, idx) => {
    // Check if line contains a number and currency indicator
    if (/[0-9]/.test(line) && /[₹$rs]/i.test(line)) {
      // Clean up common checklist prefixes
      const cleanLine = line.replace(/^[☑☐✓\-\*\d\.\s\+]+/, '').trim();

      // Extract number: look for numbers near ₹ / Rs / $
      const match = cleanLine.match(/([₹$]|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)\s*([₹$]|rs\.?|inr)?\s*[-:\s]?\s*(.*)/i);
      
      if (match && match[2]) {
        const numStr = match[2].replace(/,/g, '');
        const amount = parseFloat(numStr);

        if (!isNaN(amount) && amount > 0) {
          let name = (match[4] || '').trim();
          if (!name) {
            name = cleanLine.replace(/[\d,]+(?:\.\d{1,2})?/, '').replace(/[₹$rs\.-]/gi, '').trim() || `Item ${idx + 1}`;
          }

          items.push({
            id: `exp-${idx}-${Math.random().toString(36).slice(2, 7)}`,
            name: name || 'Expense Item',
            amount,
            category: guessCategory(name),
            person: 'You',
            status: 'Logged'
          });

          totalSum += amount;
        }
      }
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
  if (lower.includes('local') || lower.includes('metro') || lower.includes('auto') || lower.includes('cab') || lower.includes('travel') || lower.includes('fuel')) {
    return 'Transportation';
  }
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('snack')) {
    return 'Food & Grocery';
  }
  if (lower.includes('recharge') || lower.includes('wifi') || lower.includes('phone') || lower.includes('bill')) {
    return 'Bills & Utilities';
  }
  if (lower.includes('stay') || lower.includes('hotel') || lower.includes('rent')) {
    return 'Housing Expense';
  }
  return 'Site Visit Expense';
}
