'use client'
import { useState, useTransition } from 'react'
import { criarParticipante } from '@/lib/participantes/actions'
import { Button, Alert } from '@/components/ui'
import { useRouter } from 'next/navigation'

type Participante = { id: string; nome: string; whatsapp: string; ministerio?: string; funcao_id?: string; funcoes_servico?: { nome: string } }
type Funcao = { id: string; nome: string }

export function ParticipantesClient({ participantes, funcoes }: { participantes: Participante[]; funcoes: Funcao[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [busca, setBusca] = useState('')
  const [funcFiltro, setFuncFiltro] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtrados = participantes.filter(p => {
    const q = busca.toLowerCase()
    return (!q || p.nome.toLowerCase().includes(q) || p.whatsapp.includes(q)) && (!funcFiltro || p.funcao_id === funcFiltro)
  })

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await criarParticipante(fd)
      if (r?.error) { setError(r.error) } else { setSuccess(true); setShowForm(false); router.refresh(); setTimeout(() => setSuccess(false), 2000) }
    })
  }

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  return (
    <>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input style={{ ...inp, flex: 1, minWidth: '150px' }} placeholder="Buscar por nome ou WhatsApp..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select style={{ ...inp, width: '180px' }} value={funcFiltro} onChange={e => setFuncFiltro(e.target.value)}>
          <option value="">Todas as funções</option>
          {funcoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>+ Novo participante</Button>
      </div>

      {success && <div style={{ marginBottom: '12px' }}><Alert type="success" message="Participante cadastrado com sucesso!" /></div>}

      {showForm && (
        <form onSubmit={handleSave} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#f9fafb' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>Novo participante</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Nome completo *</label><input name="nome" required style={inp} placeholder="Nome do participante" /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>WhatsApp *</label>
              <input name="whatsapp" required style={inp} placeholder="+55 71 99999-0000" />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Usado para disparo automático de mensagens</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Função padrão</label>
              <select name="funcao_id" style={inp}><option value="">Selecionar...</option>{funcoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Ministério</label><input name="ministerio" style={inp} placeholder="Ex: Ministério Alegria" /></div>
          </div>
          {error && <div style={{ marginBottom: '10px' }}><Alert type="error" message={error} /></div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending}>Salvar participante</Button>
          </div>
        </form>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.5fr) minmax(0,1.5fr) 60px', gap: '10px', padding: '8px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          {['Nome', 'WhatsApp', 'Função padrão', ''].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>)}
        </div>
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Nenhum participante encontrado</p></div>
        ) : (
          filtrados.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.5fr) minmax(0,1.5fr) 60px', gap: '10px', padding: '10px 14px', alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#1d4ed8', flexShrink: 0 }}>
                  {p.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</span>
              </div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>{p.whatsapp}</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{p.funcoes_servico?.nome || '—'}</span>
              <button style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>✎</button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
