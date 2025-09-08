import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { Dashboard } from './pages/Dashboard'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
// Customer module
import { CustomersLayout } from './modules/customers/CustomersLayout.tsx'
import { CustomerList } from './modules/customers/CustomerList.tsx'
import { CustomerDetail } from './modules/customers/CustomerDetail.tsx'
import { CustomerForm } from './modules/customers/CustomerForm.tsx'
// Product module
import { ProductList } from './modules/products/ProductList.tsx'
import { ProductForm } from './modules/products/ProductForm.tsx'
import { InventoryDashboard } from './modules/products/InventoryDashboard.tsx'
import { StockEntry } from './modules/products/StockEntry.tsx'
// Sales module
import { SalesOrderList } from './modules/sales/SalesOrderList.tsx'
import { SalesOrderForm } from './modules/sales/SalesOrderForm.tsx'
import { InvoiceList } from './modules/sales/InvoiceList.tsx'
import { InvoiceForm } from './modules/sales/InvoiceForm.tsx'
// Reports module
import { ReportsHub } from './modules/reports/ReportsHub.tsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout company={{ name: 'Acme Corp' }} user={{ name: 'Jane Doe', role: 'Administrator' }} />}> 
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
          <Route path="*" element={<div className="text-sm text-neutral-500 p-6">Page not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
