import React from 'react'
import { ReportTable, type TableColumn } from '../components/ReportTable'

interface Row { id: string; account: string; amount: number; type: 'Income' | 'Expense' }

const mock: Row[] = [
  { id: '1', account: 'Sales', amount: 250000, type: 'Income' },
  { id: '2', account: 'Other Income', amount: 12000, type: 'Income' },
  { id: '3', account: 'COGS', amount: 140000, type: 'Expense' },
  { id: '4', account: 'Salaries', amount: 40000, type: 'Expense' },
  { id: '5', account: 'Rent', amount: 20000, type: 'Expense' }
]

const columns: TableColumn<Row>[] = [
  { key: 'account', header: 'Account' },
  { key: 'amount', header: 'Amount', align: 'right', render: r => r.amount.toFixed(2) }
]

export const ProfitLossReport: React.FC = () => {
  const income = mock.filter(r => r.type === 'Income').reduce((a,b) => a + b.amount, 0)
  const expense = mock.filter(r => r.type === 'Expense').reduce((a,b) => a + b.amount, 0)
  const profit = income - expense
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-neutral-800">Profit & Loss</h2>
      <ReportTable columns={columns} data={mock} />
      <div className="rounded-md border border-neutral-200 bg-white p-4 text-[11px] space-y-1">
        <p className="flex justify-between"><span>Total Income</span><span>{income.toFixed(2)}</span></p>
        <p className="flex justify-between"><span>Total Expense</span><span>{expense.toFixed(2)}</span></p>
        <p className="flex justify-between font-medium text-neutral-800"><span>Net Profit</span><span>{profit.toFixed(2)}</span></p>
      </div>
    </div>
  )
}
