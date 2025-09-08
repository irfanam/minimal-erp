import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { Dashboard } from './pages/Dashboard'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout company={{ name: 'Acme Corp' }} user={{ name: 'Jane Doe', role: 'Administrator' }} />}> 
            <Route element={<ProtectedRoute />}> 
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<div className="text-sm text-neutral-500 p-6">Page not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
