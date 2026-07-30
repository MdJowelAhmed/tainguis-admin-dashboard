import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App } from 'antd'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import { useLoginMutation } from '../../redux/api/authApi'

type DemoCredential = {
  label: string
  email: string
  password: string
}

const demoCredentials: DemoCredential[] = [
  {
    label: 'Super Admin',
    email: 'suhag10102@gmail.com',
    password: 'Test@123',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [login, { isLoading }] = useLoginMutation()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      if (res.success && res.data?.accessToken) {
        // Token is stored in Redux (& localStorage via redux-persist) inside
        // authApi.ts onQueryStarted → dispatch(setCredentials)
        message.success(res.message || 'Login successful!')
        navigate('/dashboard', { replace: true })
      } else {
        message.error(res.message || 'Login failed. Please try again.')
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } }
      message.error(error?.data?.message || 'Invalid email or password.')
    }
  }

  const fillCredential = (cred: DemoCredential) => {
    setEmail(cred.email)
    setPassword(cred.password)
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="User login illustration" />}
    >
      <AuthCard description="Welcome back! Please enter your details.">
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand hover:underline"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </PrimaryButton>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-surface-border bg-surface-elevated p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Demo credentials
            </span>
            <span className="text-[11px] text-gray-500">Click to fill</span>
          </div>
          <ul className="mt-3 space-y-2">
            {demoCredentials.map((cred) => (
              <li key={cred.email}>
                <button
                  type="button"
                  onClick={() => fillCredential(cred)}
                  className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-left transition-colors hover:border-brand hover:bg-brand/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {cred.label}
                    </span>
                    <span className="text-[11px] font-medium text-brand">
                      Use →
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-700">
                    {cred.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Password: {cred.password}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
