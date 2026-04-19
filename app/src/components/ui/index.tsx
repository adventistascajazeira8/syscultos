import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

// ── PageHeader ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', marginBottom: 0 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}

// ── Button ──────────────────────────────────────────────────
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md'; loading?: boolean }

export function Button({ variant = 'secondary', size = 'md', loading, children, disabled, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 500, borderRadius: '8px', cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? 0.6 : 1, border: 'none', fontFamily: 'inherit', transition: 'opacity .15s', ...style }
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#2563eb', color: 'white', padding: size === 'sm' ? '5px 12px' : '8px 16px', fontSize: size === 'sm' ? '12px' : '14px' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #e5e7eb', padding: size === 'sm' ? '5px 12px' : '8px 16px', fontSize: size === 'sm' ? '12px' : '14px' },
    danger:    { background: 'white', color: '#dc2626', border: '1px solid #fecaca', padding: size === 'sm' ? '5px 12px' : '8px 16px', fontSize: size === 'sm' ? '12px' : '14px' },
    ghost:     { background: 'transparent', color: '#6b7280', padding: size === 'sm' ? '5px 12px' : '8px 16px', fontSize: size === 'sm' ? '12px' : '14px' },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} disabled={disabled || loading} {...props}>
      {loading && <svg style={{ animation: 'spin 1s linear infinite', width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></svg>}
      {children}
    </button>
  )
}

// ── Input ───────────────────────────────────────────────────
type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }
export function Input({ label, hint, error, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={inputId} style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>{label}</label>}
      <input id={inputId} style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit' }} {...props} />
      {hint && !error && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────────
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string; children: React.ReactNode }
export function Select({ label, hint, error, children, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={inputId} style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>{label}</label>}
      <select id={inputId} style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', appearance: 'none' }} {...props}>{children}</select>
      {hint && !error && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ── Textarea ────────────────────────────────────────────────
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string }
export function Textarea({ label, hint, error, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label htmlFor={inputId} style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>{label}</label>}
      <textarea id={inputId} rows={3} style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} {...props} />
      {hint && !error && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ── SectionCard ─────────────────────────────────────────────
export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '10px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  )
}

// ── FormGrid ────────────────────────────────────────────────
export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '12px', marginBottom: '12px' }}>
      {children}
    </div>
  )
}

// ── StatusBadge ─────────────────────────────────────────────
const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  rascunho:  { label: 'Rascunho',  bg: '#f3f4f6', color: '#374151' },
  publicada: { label: 'Publicada', bg: '#eff6ff', color: '#1d4ed8' },
  enviada:   { label: 'Enviada',   bg: '#f0fdf4', color: '#15803d' },
  concluida: { label: 'Concluída', bg: '#f9fafb', color: '#9ca3af' },
}
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, bg: '#f3f4f6', color: '#374151' }
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.color }}>{s.label}</span>
}

// ── Alert ───────────────────────────────────────────────────
const ALERT: Record<string, { bg: string; border: string; color: string }> = {
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
}
export function Alert({ type, message }: { type: 'error' | 'success' | 'info' | 'warning'; message: string }) {
  const a = ALERT[type]
  return <div style={{ padding: '10px 12px', background: a.bg, border: `1px solid ${a.border}`, borderRadius: '8px', fontSize: '13px', color: a.color }}>{message}</div>
}

// ── EmptyState ──────────────────────────────────────────────
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>{title}</p>
      {description && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 1rem', maxWidth: '300px' }}>{description}</p>}
      {action}
    </div>
  )
}
