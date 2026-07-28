import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { App, Input } from 'antd'
import {
  Camera,
  ChevronDown,
  FileText,
  HelpCircle,
  Info,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Shield,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react'
import RichTextEditor from '../../components/editor/RichTextEditor'
import {
  resetContent,
  setContent,
  useContent,
  type ContentKey,
} from '../../components/settings/contentStore'
import {
  deleteFaq,
  useFaqs,
  type FaqItem,
} from '../../components/settings/faqStore'
import FaqFormModal from '../../components/settings/FaqFormModal'

type SectionKey =
  | 'profile'
  | 'password'
  | 'faq'
  | 'about'
  | 'privacy'
  | 'terms'

const navItems: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'about', label: 'About Us', icon: Info },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield },
  { key: 'terms', label: 'Terms of Service', icon: FileText },
]

export default function Settings() {
  const [section, setSection] = useState<SectionKey>('profile')

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile and platform configuration
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-surface-border bg-surface-card p-3">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ key, label, icon: Icon }) => {
              const active = key === section
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-gray-700 hover:bg-surface-elevated hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="rounded-2xl border border-surface-border bg-surface-card">
          {section === 'profile' && <ProfileSection />}
          {section === 'password' && <PasswordSection />}
          {section === 'faq' && <FaqSection />}
          {section === 'about' && (
            <ContentEditorSection
              contentKey="about"
              title="About Us"
              description="Edit the public About Us page content"
            />
          )}
          {section === 'privacy' && (
            <ContentEditorSection
              contentKey="privacy"
              title="Privacy Policy"
              description="Edit the public Privacy Policy content"
            />
          )}
          {section === 'terms' && (
            <ContentEditorSection
              contentKey="terms"
              title="Terms of Service"
              description="Edit the public Terms of Service content"
            />
          )}
        </section>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="border-b border-surface-border p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-900">{children}</label>
  )
}

function ProfileSection() {
  const { message } = App.useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('Super')
  const [lastName, setLastName] = useState('Admin')
  const [email, setEmail] = useState('admin@tianguislive.com')
  const [phone, setPhone] = useState('+1 (555) 123-4567')

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const save = () => {
    if (!firstName.trim() || !lastName.trim()) {
      message.warning('Name is required.')
      return
    }
    if (!email.trim()) {
      message.warning('Email is required.')
      return
    }
    message.success('Profile updated.')
  }

  return (
    <>
      <SectionHeader
        title="Profile Information"
        description="Update your personal details and profile picture"
      />

      <div className="p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-xl font-semibold text-gray-700">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                `${firstName.charAt(0)}${lastName.charAt(0)}`
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload new photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-sm hover:bg-brand-hover"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              {firstName} {lastName}
            </div>
            <div className="text-sm text-gray-700">Global Access</div>
            <p className="mt-1 text-xs text-gray-500">
              Click the camera icon to upload a new photo
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>First Name</FieldLabel>
            <Input
              className="mt-2"
              size="large"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Last Name</FieldLabel>
            <Input
              className="mt-2"
              size="large"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Email Address</FieldLabel>
            <Input
              className="mt-2"
              size="large"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Phone Number</FieldLabel>
            <Input
              className="mt-2"
              size="large"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Role</FieldLabel>
            <div className="mt-2 flex h-12 items-center rounded-md bg-surface-elevated px-3 text-sm text-gray-800">
              <span className="font-medium">Global Access</span>
              <span className="ml-2 text-xs text-gray-400">(Read-only)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-surface-border p-5">
        <button
          type="button"
          onClick={save}
          className="inline-flex h-11 items-center rounded-md bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Save Changes
        </button>
      </div>
    </>
  )
}

function PasswordSection() {
  const { message } = App.useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const save = () => {
    if (!current || !next || !confirm) {
      message.warning('All fields are required.')
      return
    }
    if (next.length < 8) {
      message.warning('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      message.warning('New passwords do not match.')
      return
    }
    setCurrent('')
    setNext('')
    setConfirm('')
    message.success('Password updated.')
  }

  return (
    <>
      <SectionHeader
        title="Change Password"
        description="Keep your account secure with a strong password"
      />
      <div className="space-y-5 p-6">
        <div>
          <FieldLabel>Current Password</FieldLabel>
          <Input.Password
            className="mt-2"
            size="large"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div>
          <FieldLabel>New Password</FieldLabel>
          <Input.Password
            className="mt-2"
            size="large"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <FieldLabel>Confirm New Password</FieldLabel>
          <Input.Password
            className="mt-2"
            size="large"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter new password"
          />
        </div>
      </div>
      <div className="flex justify-end border-t border-surface-border p-5">
        <button
          type="button"
          onClick={save}
          className="inline-flex h-11 items-center rounded-md bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Update Password
        </button>
      </div>
    </>
  )
}

function FaqSection() {
  const faqs = useFaqs()
  const { modal, message } = App.useApp()
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FaqItem | null>(null)

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (f: FaqItem) => {
    setEditing(f)
    setModalOpen(true)
  }

  const remove = (f: FaqItem) => {
    modal.confirm({
      title: 'Delete this FAQ?',
      content: f.question,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteFaq(f.id)
        message.success('FAQ deleted.')
      },
    })
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-surface-border p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the help center questions and answers
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-500">
            No FAQs yet. Add the first one to get started.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-surface-border">
          {faqs.map((f) => {
            const isOpen = openId === f.id
            return (
              <li key={f.id}>
                <div className="flex items-center gap-2 px-6 py-3 hover:bg-surface-elevated">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="flex flex-1 items-center justify-between gap-3 text-left"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {f.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-gray-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(f)}
                    aria-label="Edit FAQ"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(f)}
                    aria-label="Delete FAQ"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {isOpen && (
                  <div className="whitespace-pre-line px-6 pb-5 text-sm text-gray-600">
                    {f.answer}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <FaqFormModal
        open={modalOpen}
        faq={editing}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}

function ContentEditorSection({
  contentKey,
  title,
  description,
}: {
  contentKey: ContentKey
  title: string
  description: string
}) {
  const stored = useContent()
  const { modal, message } = App.useApp()
  const [draft, setDraft] = useState(stored[contentKey])
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    setDraft(stored[contentKey])
  }, [contentKey, stored])

  const dirty = draft !== stored[contentKey]

  const save = () => {
    setContent(contentKey, draft)
    setSavedAt(new Date().toLocaleString())
    message.success(`${title} updated.`)
  }

  const onReset = () => {
    modal.confirm({
      title: `Reset ${title}?`,
      content: 'The content will be restored to its default.',
      okText: 'Reset',
      okButtonProps: { danger: true },
      onOk: () => {
        resetContent(contentKey)
        message.success(`${title} reset to default.`)
      },
    })
  }

  return (
    <>
      <SectionHeader title={title} description={description} />
      <div className="p-6">
        <RichTextEditor
          value={draft}
          onChange={setDraft}
          placeholder={`Write the ${title} content…`}
        />
        {savedAt && (
          <p className="mt-3 text-xs text-gray-500">Last saved: {savedAt}</p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-surface-border p-5">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-700 hover:bg-surface-elevated"
        >
          <RotateCcw size={14} />
          Reset to default
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="inline-flex h-11 items-center rounded-md bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </>
  )
}
