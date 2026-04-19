import Link from 'next/link'
export default function Page() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
      </div>
      <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Módulo em desenvolvimento</h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>Este módulo será implementado no próximo passo.</p>
      <Link href="/dashboard" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>← Voltar ao dashboard</Link>
    </div>
  )
}
