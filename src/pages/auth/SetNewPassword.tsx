import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import AuthIllustration from '../../components/auth/AuthIllustration'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import BackToLoginLink from '../../components/auth/BackToLoginLink'
import { useResetPasswordMutation } from '../../redux/api/authApi'

const MIN_LENGTH = 8

export default function SetNewPassword() {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)

    try {
      const res = await resetPassword({ newPassword, confirmPassword }).unwrap()
      if (res.success) {
        message.success(res.message || 'Password reset successfully!')
        navigate('/password-reset-success')
      } else {
        message.error(res.message || 'Failed to reset password.')
      }
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to reset password. Please try again.')
    }
  }

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="Reset password illustration" />}
    >
      <AuthCard
        title="Set new password"
        description="Your new password must be different from previously used passwords."
        bordered
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <PasswordField
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            hint={`Must be at least ${MIN_LENGTH} characters.`}
          />
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset password'}
          </PrimaryButton>
        </form>
        <BackToLoginLink />
      </AuthCard>
    </AuthLayout>
  )
}
