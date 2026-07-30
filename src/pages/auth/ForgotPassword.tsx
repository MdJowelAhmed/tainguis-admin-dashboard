import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useForgotPasswordMutation } from '../../redux/api/authApi'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [email, setEmail] = useState('')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      message.error('Please enter your email address')
      return
    }

    try {
      const res = await forgotPassword({ email: trimmedEmail }).unwrap()
      if (res.success) {
        message.success(res.message || 'OTP sent to your email!')
        navigate('/check-email', { state: { email: trimmedEmail } })
      } else {
        message.error(res.message || 'Failed to send OTP. Please try again.')
      }
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to send OTP. Please try again.')
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="Forgot password illustration" />}
    >
      <AuthCard
        title="Forgot password?"
        description="No worries, we'll send you reset instructions."
        bordered
      >
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
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Submit'}
          </PrimaryButton>
        </form>
        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}
