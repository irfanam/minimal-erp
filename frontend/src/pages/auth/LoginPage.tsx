import React, { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { useNavigate, Navigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const { login, loading, error, user, initialized } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  if (initialized && user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login({ email, password, remember })
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm mb-4">AC</div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-800">Welcome</h1>
            <p className="text-xs text-neutral-500 mt-1">Sign in to your ERP workspace</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-lg p-6 shadow-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700">Email</label>
              <input type="email" autoFocus required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 px-3 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-10 w-full px-3 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 pr-10" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-0 px-3 text-xs text-neutral-500 hover:text-neutral-700">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 rounded border-neutral-300" />
                <span className="text-[11px] text-neutral-600">Remember me</span>
              </label>
              <a href="#" className="text-[11px] font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
            </div>
            {error && <div className="text-[11px] text-danger-600 bg-danger-50 border border-danger-200 px-2 py-1 rounded">{error}</div>}
            <Button type="submit" fullWidth loading={loading}>Sign In</Button>
            <p className="text-[10px] text-neutral-400 text-center leading-tight">By signing in you agree to the Terms of Service and Privacy Policy.</p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-800">Manage everything</h2>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">Modern ERP for growing businesses. Track inventory, invoices, payments and more with an elegant, fast interface inspired by ERPNext.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-left text-xs">
            <Feature title="Inventory" />
            <Feature title="Invoices" />
            <Feature title="Customers" />
            <Feature title="Suppliers" />
            <Feature title="Analytics" />
            <Feature title="Permissions" />
            <Feature title="GST" />
            <Feature title="Exports" />
            <Feature title="Automation" />
          </div>
        </div>
      </div>
    </div>
  )
}

const Feature: React.FC<{title: string}> = ({ title }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-white/60 backdrop-blur border border-neutral-200 shadow-sm">
    <span className="h-6 w-6 rounded bg-primary-100 text-primary-600 text-[10px] font-semibold flex items-center justify-center">{title[0]}</span>
    <span className="text-neutral-600">{title}</span>
  </div>
)
