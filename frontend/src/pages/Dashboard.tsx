import React from 'react'
import { StatCard, Card } from '../components/ui'
import { PageHeader } from '../components/layout'

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
  <PageHeader title="Dashboard" breadcrumbs={[{label:'Home'}]} actions={[{label:'Refresh', variant:'secondary', onClick: () => {/* refresh placeholder */}}]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales" value="$24.3k" change={12} trendLabel="vs last month" />
        <StatCard label="Purchases" value="$8.1k" change={-5} trendLabel="vs last month" />
        <StatCard label="Invoices" value={134} change={3} trendLabel="Open invoices" />
        <StatCard label="Inventory Value" value="$67.9k" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padded className="min-h-[200px]">Recent Activity (placeholder)</Card>
        <Card padded className="min-h-[200px]">Top Selling Products (placeholder)</Card>
      </div>
    </div>
  )
}
