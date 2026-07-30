import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { App, Input } from 'antd'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import FormField from '../../components/auth/FormField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useVerifyEmailMutation, useResendOtpMutation } from '../../redux/api/authApi'

type LocationState = { email?: string } | null

export default function CheckEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const state = location.state as LocationState
  const [email, setEmail] = useState(state?.email || '')
  const [otpCode, setOtpCode] = useState('')

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation()

  const onVerify = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const codeNum = Number(otpCode.trim())

    if (!trimmedEmail) {
      message.error('Please enter your email address.')
      return
    }
    if (!otpCode.trim() || isNaN(codeNum)) {
      message.error('Please enter a valid OTP code.')
      return
    }

    try {
      const res = await verifyEmail({ email: trimmedEmail, oneTimeCode: codeNum }).unwrap()
      if (res.success) {
        const resData = res?.data as any
        const token =
          typeof resData === 'string'
            ? resData
            : resData?.token || resData?.accessToken
        if (token && typeof token === 'string') {
          localStorage.setItem('resetPasswordToken', token)
        }
        message.success(res.message || 'Verification Successful')
        navigate('/reset-password')
      } else {
        message.error(res.message || 'Verification failed. Please check your OTP.')
      }
    } catch (err: any) {
      message.error(err?.data?.message || 'Invalid or expired OTP.')
    }
  }

  const handleResend = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      message.error('Please enter your email address to resend OTP.')
      return
    }

    try {
      const res = await resendOtp({ email: trimmedEmail }).unwrap()
      if (res.success) {
        message.success(res.message || 'OTP resent successfully!')
      } else {
        message.error(res.message || 'Failed to resend OTP.')
      }
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to resend OTP.')
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="Check email illustration" />}
    >
      <AuthCard
        title="Verify OTP Code"
        description={`We sent a verification code to ${email || 'your email'}`}
        bordered
      >
        <form onSubmit={onVerify} className="space-y-5">
          {!state?.email && (
            <FormField
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              One-Time Verification Code (OTP)
            </label>
            {Input.OTP ? (
              <Input.OTP
                length={6}
                value={otpCode}
                onChange={(val) => setOtpCode(val)}
                size="large"
                className="w-full justify-between"
              />
            ) : (
              <Input
                type="number"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                size="large"
              />
            )}
          </div>

          <PrimaryButton type="submit" disabled={isVerifying || !otpCode}>
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </PrimaryButton>

          <p className="mt-5 text-center text-sm text-gray-600">
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-brand hover:underline disabled:opacity-50"
            >
              {isResending ? 'Resending...' : 'Click to resend'}
            </button>
          </p>
        </form>

        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}
