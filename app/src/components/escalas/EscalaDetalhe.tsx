'use client'
import { useState, useTransition } from 'react'
import { adicionarEscalado, removerEscalado, gerarWhatsAppEscala } from '@/lib/escalas/actions'
import { useRouter } from 'next/navigation'
import { Button, StatusBadge } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

type Participante = { id: string; nome: string; whatsapp: string; ministerio?: string; funcao_id?: string }

export function EscalaDetalhe({ escala, participantes }: { escala: any; participantes: Participante[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [wpp, setWpp] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null) // escala_funcao_id

  const culto = escala.cultos
  const funcoes = (escala.escala_funcoes || []).sort((a: any, b: any) => a.ordem - b.ordem)
  const dataFmt = new Date(escala.data_escala + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalEscalados = funcoes.reduce((acc: number, ef: any) => acc + (ef.escalados?.length || 0), 0)

  function participantesDisponiveis(efId: string, funcaoId?: string) {
    const jaEscalados = funcoes.find((ef: any) => ef.id === efId)?.escalados?.map((e: any) => e.participante_id) || []
    return participantes.filter(p => !jaEscalados.includes(p.id))
  }

  function handleAdd(efId: string, participanteId: string) {
    startTransition(async () => {
      await adicionarEscalado(efId, participanteId)
      router.refresh()
      setAddingTo(null)
    })
  }

  function handleRemove(escaladoId: string) {
    startTransition(async () => {
      await removerEscalado(escaladoId)
      router.refresh()
    })
  }

  async function handleWpp() {
    const texto = await gerarWhatsAppEscala(escala.id)
    setWpp(texto)
  }

  const inp = { padding: '7px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '7px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
            {culto ? (TIPO[culto.tipo] || culto.tipo) : 'Escala de Serviço'}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{dataFmt}</p>
          {escala.ministerio && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Ministério: {escala.ministerio}</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusBadge status={escala.status} />
          <Button variant="secondary" size="sm" loading={isPending} onClick={handleWpp}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 10.5A2.5 2.5 0 1 1 10.5 8H13v2.5z"/><path d="M3 5.5A2.5 2.5 0 1 1 5.5 8H3V5.5z"/>
              <path d="M5.5 3A2.5 2.5 0 1 1 8 5.5V3H5.5z"/><path d="M10.5 13A2.5 2.5 0 1 1 8 10.5V13h2.5z"/>
            </svg>
            Disparar WhatsApp
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Funções',   value: funcoes.length },
          { label: 'Escalados', value: totalEscalados },
          { label: 'Status',    value: escala.status },
        ].map(m => (
          <div key={m.label} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>{m.label}</p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Funções e escalados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {funcoes.map((ef: any) => {
          const nomeFuncao = ef.funcoes_servico?.nome || ef.nome_custom || 'Função'
          const escalados = ef.escalados || []
          const disponiveis = participantesDisponiveis(ef.id, ef.funcao_id)

          return (
            <div key={ef.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{nomeFuncao}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{escalados.length} escalado(s)</span>
                </div>
                {addingTo !== ef.id
                  ? <button type="button" onClick={() => setAddingTo(ef.id)} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 2v10M2 7h10"/></svg>
                      Adicionar
                    </button>
                  : <button type="button" onClick={() => setAddingTo(null)} style={{ fontSize: '12px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>}
              </div>

              <div style={{ padding: '10px 14px' }}>
                {/* Lista de escalados */}
                {escalados.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: addingTo === ef.id ? '10px' : '0' }}>
                    {escalados.map((e: any) => (
                      <div key={e.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 8px 5px 6px', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '13px', background: 'white', color: '#111827' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, color: '#1d4ed8', flexShrink: 0 }}>
                          {(e.participantes_escala?.nome || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        {e.participantes_escala?.nome || '—'}
                        <button onClick={() => handleRemove(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '11px', lineHeight: 1, padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: addingTo === ef.id ? '0 0 10px' : '0' }}>Nenhum escalado ainda.</p>
                )}

                {/* Adicionar participante */}
                {addingTo === ef.id && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={inp} onChange={e => { if (e.target.value) { handleAdd(ef.id, e.target.value); e.target.value = '' } }} defaultValue="">
                      <option value="" disabled>Selecionar participante...</option>
                      {disponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}{p.ministerio ? ` — ${p.ministerio}` : ''}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal WhatsApp */}
      {wpp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '460px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Pré-visualização — WhatsApp</p>
              <button onClick={() => setWpp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '14px', maxHeight: '55vh', overflowY: 'auto' }}>
              <pre style={{ fontSize: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, color: '#111827', margin: 0 }}>{wpp}</pre>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => navigator.clipboard.writeText(wpp)} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Copiar texto</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => setWpp(null)}>Fechar</Button>
                <Button variant="primary" size="sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(wpp)}`, '_blank'); setWpp(null) }}>Abrir no WhatsApp</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
