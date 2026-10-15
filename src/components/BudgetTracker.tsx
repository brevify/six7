import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  Users, 
  ArrowRight,
  Globe
} from 'lucide-react';
import { ExpenseItem, FullItinerary } from '../types';

interface BudgetTrackerProps {
  itinerary: FullItinerary | null;
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'timestamp'>) => void;
  onDeleteExpense: (id: string) => void;
}

const EXCHANGE_RATES: Record<string, { rate: number; symbol: string; label: string }> = {
  SGD: { rate: 1, symbol: 'S$', label: 'Singapore Dollar' },
  USD: { rate: 0.74, symbol: '$', label: 'US Dollar' },
  EUR: { rate: 0.69, symbol: '€', label: 'Euro' },
  GBP: { rate: 0.59, symbol: '£', label: 'British Pound' },
  AUD: { rate: 1.14, symbol: 'A$', label: 'Australian Dollar' },
  JPY: { rate: 112.5, symbol: '¥', label: 'Japanese Yen' },
  CNY: { rate: 5.35, symbol: '¥', label: 'Chinese Yuan' },
};

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  itinerary,
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [currency, setCurrency] = useState<string>('SGD');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Expense form state
  const [title, setTitle] = useState('');
  const [amountSgd, setAmountSgd] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('hawker');
  const [dayNumber, setDayNumber] = useState(1);
  const [paidBy, setPaidBy] = useState('Me');
  const [splitWith, setSplitWith] = useState<string[]>(['Me']);
  const [receiptNote, setReceiptNote] = useState('');

  const totalBudgetSgd = itinerary?.totalBudgetSgd || 300;
  const totalSpentSgd = expenses.reduce((sum, item) => sum + item.amountSgd, 0);
  const remainingBudgetSgd = totalBudgetSgd - totalSpentSgd;
  const budgetPercentUsed = Math.min(Math.round((totalSpentSgd / (totalBudgetSgd || 1)) * 100), 100);

  const currentRate = EXCHANGE_RATES[currency] || EXCHANGE_RATES.SGD;
  const formatCur = (amountInSgd: number) => {
    const val = amountInSgd * currentRate.rate;
    if (currency === 'JPY') {
      return `${currentRate.symbol} ${Math.round(val).toLocaleString()}`;
    }
    return `${currentRate.symbol} ${val.toFixed(2)}`;
  };

  // Group by category
  const categoryTotals: Record<string, number> = {
    hawker: 0,
    dining: 0,
    'mrt-transit': 0,
    'grab-taxi': 0,
    attraction: 0,
    shopping: 0,
    misc: 0,
  };

  expenses.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amountSgd;
    } else {
      categoryTotals.misc += e.amountSgd;
    }
  });

  const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
    hawker: { label: 'Hawker & Local Food', icon: '🍜', color: 'bg-amber-500' },
    dining: { label: 'Cafes & Dining', icon: '🍽️', color: 'bg-orange-500' },
    'mrt-transit': { label: 'MRT & Bus Transit', icon: '🚇', color: 'bg-emerald-500' },
    'grab-taxi': { label: 'Grab & Taxis', icon: '🚕', color: 'bg-teal-500' },
    attraction: { label: 'Attractions & Entry', icon: '🎟️', color: 'bg-blue-500' },
    shopping: { label: 'Gifts & Shopping', icon: '🛍️', color: 'bg-purple-500' },
    misc: { label: 'Miscellaneous', icon: '📦', color: 'bg-slate-400' },
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountSgd) return;
    onAddExpense({
      title,
      amountSgd: parseFloat(amountSgd),
      category,
      dayNumber,
      paidBy,
      splitWith,
      receiptNote
    });

    setTitle('');
    setAmountSgd('');
    setReceiptNote('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview & Currency Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Trip Budget & Expense Manager</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track your actual spends against the Singapore budget cap in real-time
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <Globe className="w-4 h-4 text-slate-500 ml-2" />
          <span className="text-xs text-slate-500 font-medium">Display Currency:</span>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
          >
            {Object.entries(EXCHANGE_RATES).map(([key, info]) => (
              <option key={key} value={key}>
                {key} ({info.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Trip Budget Cap</span>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
            {formatCur(totalBudgetSgd)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            S$ {totalBudgetSgd} SGD baseline ({itinerary?.preferences?.durationDays || 3} days)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Spent to Date</span>
          <div className="text-2xl font-bold text-amber-700 font-mono-numbers mt-1">
            {formatCur(totalSpentSgd)}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercentUsed > 90 ? 'bg-red-500' : 'bg-amber-600'
              }`}
              style={{ width: `${budgetPercentUsed}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {budgetPercentUsed}% of total budget used
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Remaining Balance</span>
          <div className={`text-2xl font-bold font-mono-numbers mt-1 ${
            remainingBudgetSgd < 0 ? 'text-red-600' : 'text-emerald-700'
          }`}>
            {formatCur(remainingBudgetSgd)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {remainingBudgetSgd >= 0 ? 'Within budget pace' : 'Budget overrun detected'}
          </span>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Expense Allocation by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryTotals).map(([catKey, total]) => {
            const meta = categoryLabels[catKey] || categoryLabels.misc;
            return (
              <div key={catKey} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span>{meta.icon}</span>
                  <span className="truncate">{meta.label}</span>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono-numbers mt-1">
                  {formatCur(total)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Logging Form Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Logged Trip Receipts & Spends</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Log Expense'}</span>
          </button>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">Add New Expense (SGD)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Item Name / Receipt</label>
                <input
                  type="text"
                  placeholder="e.g., Tian Tian Chicken Rice + Sugar Cane"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Amount (SGD S$)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="7.50"
                  value={amountSgd}
                  onChange={e => setAmountSgd(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="hawker">Hawker & Street Food</option>
                  <option value="dining">Cafes & Dining</option>
                  <option value="mrt-transit">MRT & Bus Transit</option>
                  <option value="grab-taxi">Grab & Taxi</option>
                  <option value="attraction">Attractions & Entry</option>
                  <option value="shopping">Shopping</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Itinerary Day</label>
                <select
                  value={dayNumber}
                  onChange={e => setDayNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Paid By</label>
                <input
                  type="text"
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                  placeholder="e.g. Me / Sarah"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Optional Note</label>
                <input
                  type="text"
                  value={receiptNote}
                  onChange={e => setReceiptNote(e.target.value)}
                  placeholder="Cash at stall 23"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                Record Expense
              </button>
            </div>
          </form>
        )}

        {/* Expenses Table */}
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No expenses logged yet. Tap "Log Expense" to record a meal or MRT fare.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map(item => {
              const meta = categoryLabels[item.category] || categoryLabels.misc;
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Day {item.dayNumber}</span>
                        <span>·</span>
                        <span>{meta.label}</span>
                        <span>·</span>
                        <span>Paid by {item.paidBy}</span>
                        {item.receiptNote && (
                          <>
                            <span>·</span>
                            <span className="italic">{item.receiptNote}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono-numbers">
                        {formatCur(item.amountSgd)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-numbers">
                        S$ {item.amountSgd.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
