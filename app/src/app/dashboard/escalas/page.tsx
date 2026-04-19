import Link from 'next/link'
import { listarEscalas } from '@/lib/escalas/actions'
import { PageHeader, EmptyState, Button } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

export default async function EscalasPage() {
  const escalas = await listarEscalas()

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Escalas de Serviço" subtitle="Gerencie as equipes por culto"
        actions={<Link href="/dashboard/escalas/nova"><Button variant="primary" size="sm">+ Nova escala</Button></Link>} />

      {escalas.length === 0 ? (
        <EmptyState title="Nenhuma escala criada" description="Crie escalas para organizar as equipes de serviço."
          action={<Link href="/dashboard/escalas/nova"><Button variant="primary" size="sm">Criar primeira escala</Button></Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {escalas.map(e => {
            const culto = e.cultos as any
            const dataFmt = new Date(e.data_escala + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
            const totalEscalados = (e.escala_funcoes || []).reduce((acc: number, ef: any) => acc + (ef.escalados?.length || 0), 0)
            const funcoes = (e.escala_funcoes || []).map((ef: any) => ef.funcoes_servico?.nome || ef.nome_custom || '').filter(Boolean)

            const statusCor: Record<string, string> = { rascunho: '#f3f4f6', publicada: '#eff6ff', enviada: '#f0fdf4', concluida: '#f9fafb' }
            const statusTxt: Record<string, string> = { rascunho: '#374151', publicada: '#1d4ed8', enviada: '#15803d', concluida: '#9ca3af' }

            return (
              <Link key={e.id} href={`/dashboard/escalas/${e.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', background: 'white' }}>
                <div style={{ width: '44px', height: '44px', background: '#eeedfe', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: '#6d28d9', fontWeight: 600, textTransform: 'uppercase' }}>{new Date(e.data_escala + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#5b21b6', lineHeight: 1 }}>{new Date(e.data_escala + 'T12:00:00').getDate()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>
                    {culto ? (TIPO[culto.tipo] || culto.tipo) : dataFmt}
                    {e.ministerio && <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>· {e.ministerio}</span>}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{totalEscalados} escalado(s) · {funcoes.slice(0, 3).join(', ')}{funcoes.length > 3 ? '...' : ''}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px', background: statusCor[e.status] || '#f3f4f6', color: statusTxt[e.status] || '#374151', flexShrink: 0 }}>{e.status}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
