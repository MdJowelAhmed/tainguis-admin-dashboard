import { useEffect, useState } from 'react'
import { Modal, Form, Input, App } from 'antd'
import { updateUser } from './usersStore'
import type { UserRecord } from './usersData'

type Props = {
  user: UserRecord | null
  onClose: () => void
}

type FormValues = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

export default function EditUserModal({ user, onClose }: Props) {
  const [form] = Form.useForm<FormValues>()
  const { message } = App.useApp()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
      })
    }
  }, [user, form])

  const handleSubmit = async () => {
    if (!user) return
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      updateUser(user.id, values)
      message.success('User updated.')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!user}
      title={user ? `Edit ${user.name}` : 'Edit user'}
      okText="Save changes"
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form layout="vertical" form={form} requiredMark={false}>
        <Form.Item
          label="Full name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="City" name="city">
            <Input />
          </Form.Item>
          <Form.Item label="Country" name="country">
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
