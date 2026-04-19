import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

export default async function ProgramacoesPage() {
  const supabase = await createClient()
  const { data: programacoes } = await supabase.from('programacoes').select('*, cultos(*)').order('updated_at', { ascending: false }).limit(40)

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Programações" subtitle="Acesse e edite as programações de cada culto" />
      {!programacoes?.length ? <EmptyState title="Nenhuma programação" description="Crie um culto para gerar programações." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {programacoes.map(prog => {
            const culto = prog.cultos as any
            const data = culto ? new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
            return (
              <Link key={prog.id} href={`/dashboard/programacoes/${prog.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', background: 'white' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>
                    {prog.bloco === 'principal' ? TIPO[culto?.tipo] || 'Programação' : prog.bloco}
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>— {data}</span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{prog.ministerio_responsavel || 'Ministério não definido'}{prog.anciao_mes && ` · Anc. ${prog.anciao_mes}`}</p>
                </div>
                <StatusBadge status={prog.status} />
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
