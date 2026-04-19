import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, StatusBadge, Button, SectionCard, EmptyState } from '@/components/ui'
import { StatusActions } from '@/components/cultos/StatusActions'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

export default async function CultoPage({ params }: { params: Promise<{ culto_id: string }> }) {
  const { culto_id } = await params
  const supabase = await createClient()

  const { data: culto, error } = await supabase.from('cultos').select('*').eq('culto_id', culto_id).single()
  if (error || !culto) notFound()

  const [{ data: programacoes }, { data: escala }, { data: midias }] = await Promise.all([
    supabase.from('programacoes').select('*, itens_programa(*)').eq('culto_id', culto_id),
    supabase.from('escalas').select('*').eq('culto_id', culto_id).maybeSingle(),
    supabase.from('midias').select('*').eq('culto_id', culto_id),
  ])

  const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader title={TIPO[culto.tipo] || culto.tipo} subtitle={dataFmt}
        actions={<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><StatusBadge status={culto.status} /><StatusActions cultoId={culto.culto_id} status={culto.status} /></div>} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>ID:</span>
        <code style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{culto.culto_id}</code>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        <div>
          <SectionCard title="Programações">
            {programacoes?.length ? programacoes.map(prog => (
              <Link key={prog.id} href={`/dashboard/programacoes/${prog.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', background: 'white' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{prog.bloco === 'principal' ? TIPO[culto.tipo] : prog.bloco}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{prog.itens_programa?.length ?? 0} itens · {prog.ministerio_responsavel || 'Sem ministério'}</p>
                </div>
                <StatusBadge status={prog.status} />
              </Link>
            )) : <EmptyState title="Nenhuma programação" />}
          </SectionCard>

          <SectionCard title="Mídias">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <Link href={`/dashboard/midias/nova?culto=${culto_id}`}><Button variant="ghost" size="sm">+ Enviar mídia</Button></Link>
            </div>
            {midias?.length ? midias.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#374151' }}>{m.titulo || 'Sem título'}</span>
                {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb' }}>Abrir</a>}
              </div>
            )) : <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '16px 0', margin: 0 }}>Nenhuma mídia enviada</p>}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Ações">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {programacoes?.[0] && <Link href={`/dashboard/programacoes/${programacoes[0].id}`}><Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>Montar programação</Button></Link>}
              {escala
                ? <Link href={`/dashboard/escalas/${escala.id}`}><Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>Ver escala de serviço</Button></Link>
                : <Link href={`/dashboard/escalas/nova?culto=${culto_id}`}><Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>Criar escala de serviço</Button></Link>}
              <Link href={`/dashboard/musicas/nova?culto=${culto_id}`}><Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>Cadastrar músicas</Button></Link>
              {programacoes?.[0] && <a href={`/api/programacao/${programacoes[0].id}/word`} target="_blank"><Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>Gerar documento Word</Button></a>}
            </div>
          </SectionCard>

          <SectionCard title="Detalhes">
            {[
              { label: 'Data',       value: new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR') },
              { label: 'Tipo',       value: TIPO[culto.tipo] || culto.tipo },
              { label: 'Criado em',  value: new Date(culto.created_at).toLocaleDateString('pt-BR') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>{value}</span>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
