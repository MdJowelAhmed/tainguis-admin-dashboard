import { useEffect, useState } from 'react'
import { App, Input, Modal } from 'antd'
import { addFaq, updateFaq, type FaqItem } from './faqStore'

type Props = {
  open: boolean
  faq?: FaqItem | null
  onClose: () => void
}

export default function FaqFormModal({ open, faq, onClose }: Props) {
  const { message } = App.useApp()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    if (!open) return
    if (faq) {
      setQuestion(faq.question)
      setAnswer(faq.answer)
    } else {
      setQuestion('')
      setAnswer('')
    }
  }, [open, faq])

  const submit = () => {
    const q = question.trim()
    const a = answer.trim()
    if (!q) return message.warning('Question is required.')
    if (!a) return message.warning('Answer is required.')

    if (faq) {
      updateFaq(faq.id, { question: q, answer: a })
      message.success('FAQ updated.')
    } else {
      addFaq(q, a)
      message.success('FAQ added.')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={faq ? 'Edit FAQ' : 'Add FAQ'}
      okText={faq ? 'Save changes' : 'Add FAQ'}
      onOk={submit}
      onCancel={onClose}
      destroyOnClose
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Question
          </label>
          <Input
            className="mt-2"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How do I reset a customer password?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Answer
          </label>
          <Input.TextArea
            className="mt-2"
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write a clear, concise answer."
          />
        </div>
      </div>
    </Modal>
  )
}
