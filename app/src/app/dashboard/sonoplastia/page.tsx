import Link from 'next/link'
import { listarProgramacoesSono } from '@/lib/sonoplastia/actions'
import { PageHeader, EmptyState } from '@/components/ui'
import { SonoplastiaCard } from '@/components/sonoplastia/SonoplastiaCard'

export default async function SonoplastiaPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const programacoes = await listarProgramacoesSono(params.status ? { status: params.status } : undefined)
  const cnt = { publicada: programacoes.filter(p => p.status === 'publicada').length, enviada: programacoes.filter(p => p.status === 'enviada').length, rascunho: programacoes.filter(p => p.status === 'rascunho').length, concluida: programacoes.filter(p => p.status === 'concluida').length }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader title="Painel da Sonoplastia" subtitle="Visualize, exporte e envie as programações" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[{ label: 'Publicadas', v: cnt.publicada, color: '#2563eb', bg: '#eff6ff' }, { label: 'Enviadas', v: cnt.enviada, color: '#16a34a', bg: '#f0fdf4' }, { label: 'Rascunhos', v: cnt.rascunho, color: '#374151', bg: '#f9fafb' }, { label: 'Concluídas', v: cnt.concluida, color: '#9ca3af', bg: '#f9fafb' }].map(m => (
          <div key={m.label} style={{ background: m.bg, borderRadius: '10px', padding: '12px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>{m.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: m.color, margin: 0 }}>{m.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[{ label: 'Todas', v: undefined }, { label: 'Publicadas', v: 'publicada' }, { label: 'Enviadas', v: 'enviada' }, { label: 'Rascunhos', v: 'rascunho' }, { label: 'Concluídas', v: 'concluida' }].map(f => (
          <Link key={f.label} href={f.v ? `/dashboard/sonoplastia?status=${f.v}` : '/dashboard/sonoplastia'}
            style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, textDecoration: 'none', background: params.status === f.v || (!params.status && !f.v) ? '#2563eb' : '#f3f4f6', color: params.status === f.v || (!params.status && !f.v) ? 'white' : '#4b5563' }}>
            {f.label}
          </Link>
        ))}
      </div>

      {programacoes.length === 0
        ? <EmptyState title="Nenhuma programação encontrada" description="As programações aparecem aqui quando publicadas." action={<Link href="/dashboard/cultos/novo" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Criar culto</Link>} />
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{programacoes.map(p => <SonoplastiaCard key={p.id} prog={p} />)}</div>}
    </div>
  )
}
