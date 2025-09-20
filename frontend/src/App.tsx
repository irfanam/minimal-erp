import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React, { Suspense } from 'react'
import { MainLayout } from './components/layout'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/notifications/ToastNotifications'
import { queryClient } from './utils/queryClient'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const CustomersLayout = React.lazy(() => import('./modules/customers/CustomersLayout.tsx'))
const CustomerList = React.lazy(() => import('./modules/customers/CustomerList.tsx'))
const CustomerDetail = React.lazy(() => import('./modules/customers/CustomerDetail.tsx'))
const CustomerForm = React.lazy(() => import('./modules/customers/CustomerForm.tsx'))
const ProductList = React.lazy(() => import('./modules/products/ProductList.tsx'))
const ProductForm = React.lazy(() => import('./modules/products/ProductForm.tsx'))
const InventoryDashboard = React.lazy(() => import('./modules/products/InventoryDashboard.tsx'))
const StockEntry = React.lazy(() => import('./modules/products/StockEntry.tsx'))
const SalesOrderList = React.lazy(() => import('./modules/sales/SalesOrderList.tsx'))
const SalesOrderForm = React.lazy(() => import('./modules/sales/SalesOrderForm.tsx'))
const InvoiceList = React.lazy(() => import('./modules/sales/InvoiceList.tsx'))
const InvoiceForm = React.lazy(() => import('./modules/sales/InvoiceForm.tsx'))
const ReportsHub = React.lazy(() => import('./modules/reports/ReportsHub.tsx'))

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
          <Suspense fallback={<div className="p-6 text-xs text-neutral-500">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<MainLayout company={{ name: 'Acme Corp' }} />}> 
                <Route element={<ProtectedRoute />}> 
                  <Route path="/" element={<Dashboard />} />
                  <Route path="customers" element={<CustomersLayout />}>
                    <Route index element={<CustomerList />} />
                    <Route path=":id" element={<CustomerDetail />} />
                    <Route path="new" element={<CustomerForm />} />
                    <Route path=":id/edit" element={<CustomerForm />} />
                  </Route>
                  <Route path="products" element={<div className="px-6 py-6"><ProductList /></div>} />
                  <Route path="products/new" element={<div className="px-6 py-6"><ProductForm /></div>} />
                  <Route path="inventory" element={<div className="px-6 py-6"><InventoryDashboard /></div>} />
                  <Route path="stock-entry" element={<div className="px-6 py-6"><StockEntry /></div>} />
                  <Route path="sales-orders" element={<div className="px-6 py-6"><SalesOrderList /></div>} />
                  <Route path="sales-orders/new" element={<div className="px-6 py-6"><SalesOrderForm /></div>} />
                  <Route path="invoices" element={<div className="px-6 py-6"><InvoiceList /></div>} />
                  <Route path="invoices/new" element={<div className="px-6 py-6"><InvoiceForm /></div>} />
                  <Route path="reports" element={<div className="px-6 py-6"><ReportsHub /></div>} />
                </Route>
              </Route>
              <Route path="*" element={<div className="text-sm text-neutral-500 p-6" role="alert" aria-live="polite">Page not found</div>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
