import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, EmptyState } from '@/components/ui'

export default async function ResponsaveisPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <PageHeader title="Responsáveis" subtitle="Usuários com acesso ao SysCultos" />

      <div style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: 500, margin: '0 0 4px' }}>Gerenciar usuários</p>
        <p style={{ fontSize: '12px', color: '#3b82f6', margin: '0 0 10px' }}>Para convidar um novo membro da equipe, acesse o painel do Supabase.</p>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Abrir Supabase → Authentication → Users
        </a>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>Como adicionar usuários</p>
        <ol style={{ fontSize: '13px', color: '#4b5563', margin: 0, paddingLeft: '18px', lineHeight: 2 }}>
          <li>Acesse supabase.com → seu projeto</li>
          <li>Vá em <strong>Authentication → Users</strong></li>
          <li>Clique em <strong>Invite user</strong></li>
          <li>Digite o e-mail da pessoa — ela recebe o link de acesso automaticamente</li>
        </ol>
      </div>
    </div>
  )
}
