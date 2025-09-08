import React from 'react'
import type { LineItem } from './LineItemTable'

interface Props { items: LineItem[] }

// Simple GST breakdown (assumes all intra-state for demo)
export const TaxCalculator: React.FC<Props> = ({ items }) => {
  const taxable = items.reduce((a,b) => a + (b.qty * b.rate) * (1 - (b.discountPct||0)/100), 0)
  const gst = items.reduce((a,b) => a + ((b.gstPct||0) * (b.qty * b.rate) * (1 - (b.discountPct||0)/100) /100), 0)
  const cgst = gst / 2
  const sgst = gst / 2
  return (
    <div className="text-[11px] text-neutral-600 space-y-1">
      <p className="flex justify-between"><span>Taxable Amount</span><span>{taxable.toFixed(2)}</span></p>
      <p className="flex justify-between"><span>CGST</span><span>{cgst.toFixed(2)}</span></p>
      <p className="flex justify-between"><span>SGST</span><span>{sgst.toFixed(2)}</span></p>
      <p className="flex justify-between font-medium text-neutral-800"><span>Total GST</span><span>{gst.toFixed(2)}</span></p>
    </div>
  )
}
