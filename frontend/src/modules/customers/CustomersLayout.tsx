import React from 'react'
import { Outlet } from 'react-router-dom'

const CustomersLayout: React.FC = () => {
  return (
    <div className="px-6 py-6 space-y-6">
      <Outlet />
    </div>
  )
}

export default CustomersLayout
