import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatusBadge, Button, EmptyState } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

export default async function CultosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase.from('cultos').select('*').order('data', { ascending: false })
  if (params.status) query = query.eq('status', params.status)
  const { data: cultos } = await query

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Cultos" subtitle="Gerencie todos os cultos e programações"
        actions={<Link href="/dashboard/cultos/novo"><Button variant="primary" size="sm">+ Novo culto</Button></Link>} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ label: 'Todos', v: undefined }, { label: 'Rascunho', v: 'rascunho' }, { label: 'Publicados', v: 'publicada' }, { label: 'Enviados', v: 'enviada' }].map(f => (
          <Link key={f.label} href={f.v ? `/dashboard/cultos?status=${f.v}` : '/dashboard/cultos'}
            style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, textDecoration: 'none', background: params.status === f.v || (!params.status && !f.v) ? '#2563eb' : '#f3f4f6', color: params.status === f.v || (!params.status && !f.v) ? 'white' : '#4b5563' }}>
            {f.label}
          </Link>
        ))}
      </div>

      {!cultos?.length ? (
        <EmptyState title="Nenhum culto encontrado" description="Crie o primeiro culto para começar."
          action={<Link href="/dashboard/cultos/novo"><Button variant="primary" size="sm">Criar primeiro culto</Button></Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cultos.map(c => {
            const d = new Date(c.data + 'T12:00:00')
            return (
              <Link key={c.culto_id} href={`/dashboard/cultos/${c.culto_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', background: 'white' }}>
                <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#1d4ed8', lineHeight: 1 }}>{d.getDate()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{TIPO[c.tipo] || c.tipo}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>{c.culto_id}</p>
                </div>
                <StatusBadge status={c.status} />
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
