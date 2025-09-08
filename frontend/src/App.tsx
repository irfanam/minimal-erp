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
            </Route>
          </Route>
          <Route path="*" element={<div className="text-sm text-neutral-500 p-6">Page not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
