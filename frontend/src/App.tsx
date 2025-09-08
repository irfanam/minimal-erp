import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <MainLayout company={{ name: 'Acme Corp' }} user={{ name: 'Jane Doe', role: 'Administrator' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<div className="text-sm text-neutral-500">Page not found</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
