import React from 'react'
import type { ChartContainerProps } from '../charts/ChartBase'
import { ChartContainer } from '../charts/ChartBase'
import clsx from 'clsx'

export interface WidgetFrameProps extends ChartContainerProps {
  footer?: React.ReactNode
  className?: string
}

export const ChartWidget: React.FC<WidgetFrameProps> = ({ className, footer, ...rest }) => {
  return (
    <div className={clsx('h-full flex flex-col rounded-md border border-neutral-200 bg-white p-4 shadow-sm', className)}>
      <ChartContainer {...rest} />
      {footer && (
        <div className="pt-3 mt-auto text-[11px] text-neutral-500 border-t border-neutral-100">{footer}</div>
      )}
    </div>
  )
}
