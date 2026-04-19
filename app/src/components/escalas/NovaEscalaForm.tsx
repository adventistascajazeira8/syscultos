'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarEscala } from '@/lib/escalas/actions'
import { Button, Alert } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
const MINISTERIOS = ['Diretoria Geral', 'Ministério Alegria', 'Ministério Jovem', 'Ministério da Mulher', 'Desbravadores', 'Aventureiros']

type Funcao = { id: string; nome: string; tipo: string; cor: string }
type Culto  = { culto_id: string; tipo: string; data: string }

type FuncaoSelecionada = { id?: string; nome: string; custom: boolean; selecionada: boolean }

export function NovaEscalaForm({ funcoes, cultos, cultoIdInicial }: { funcoes: Funcao[]; cultos: Culto[]; cultoIdInicial?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [novaFuncNome, setNovaFuncNome] = useState('')
  const [showNovaFunc, setShowNovaFunc] = useState(false)

  const [funcSel, setFuncSel] = useState<FuncaoSelecionada[]>(
    funcoes.map(f => ({ id: f.id, nome: f.nome, custom: false, selecionada: true }))
  )

  const COR_FUNC: Record<string, { bg: string; color: string }> = {
    verde:  { bg: '#f0fdf4', color: '#15803d' },
    azul:   { bg: '#eff6ff', color: '#1d4ed8' },
    roxo:   { bg: '#f5f3ff', color: '#6d28d9' },
    ambar:  { bg: '#fffbeb', color: '#92400e' },
    coral:  { bg: '#fff1f2', color: '#be123c' },
    rosa:   { bg: '#fdf2f8', color: '#9d174d' },
    teal:   { bg: '#f0fdfa', color: '#0f766e' },
    cinza:  { bg: '#f9fafb', color: '#374151' },
  }

  const funcaoCorPorNome = (nome: string) => {
    const f = funcoes.find(x => x.nome === nome)
    return f ? (COR_FUNC[f.cor] || COR_FUNC.cinza) : COR_FUNC.cinza
  }

  function toggleFunc(idx: number) {
    setFuncSel(prev => prev.map((f, i) => i === idx ? { ...f, selecionada: !f.selecionada } : f))
  }

  function selAll(v: boolean) { setFuncSel(prev => prev.map(f => ({ ...f, selecionada: v }))) }

  function addCustomFunc() {
    if (!novaFuncNome.trim()) return
    setFuncSel(prev => [...prev, { nome: novaFuncNome.trim(), custom: true, selecionada: true }])
    setNovaFuncNome('')
    setShowNovaFunc(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const selecionadas = funcSel.filter(f => f.selecionada)
    if (selecionadas.length === 0) { setError('Selecione ao menos uma função.'); return }
    fd.set('funcoes', JSON.stringify(selecionadas.map((f, i) => ({ funcao_id: f.id, nome_custom: f.custom ? f.nome : null, ordem: i }))))
    startTransition(async () => {
      const r = await criarEscala(fd)
      if (r?.error) setError(r.error)
    })
  }

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }
  const selecionadasCount = funcSel.filter(f => f.selecionada).length

  return (
    <div style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontFamily: 'inherit' }}>← Voltar</button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Nova escala de serviço</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Identificação */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Identificação</p>
          </div>
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Culto vinculado</label>
                <select name="culto_id" style={inp} defaultValue={cultoIdInicial || ''}>
                  <option value="">Nenhum (escala avulsa)</option>
                  {cultos.map(c => <option key={c.culto_id} value={c.culto_id}>{TIPO[c.tipo] || c.tipo} — {new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR')}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Data *</label>
                <input name="data_escala" type="date" required style={inp} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Ministério responsável</label>
                <select name="ministerio" style={inp}>
                  <option value="">Selecionar...</option>
                  {MINISTERIOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Observação</label>
                <input name="observacao" style={inp} placeholder="Ex: Confirmar até sexta" />
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de funções */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Funções desta escala</p>
            <span style={{ fontSize: '12px', color: '#6b7280' }}><strong style={{ color: '#111827' }}>{selecionadasCount}</strong> de {funcSel.length} selecionadas</span>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => selAll(true)} style={{ fontSize: '12px', padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>Selecionar todas</button>
              <button type="button" onClick={() => selAll(false)} style={{ fontSize: '12px', padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>Limpar seleção</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginBottom: '10px' }}>
              {funcSel.map((f, i) => {
                const cor = funcaoCorPorNome(f.nome)
                return (
                  <div key={i} onClick={() => toggleFunc(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: f.selecionada ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: f.selecionada ? '#eff6ff' : 'white', transition: 'all .15s', userSelect: 'none' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: f.selecionada ? 'none' : '1px solid #d1d5db', background: f.selecionada ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {f.selecionada && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2"><path d="M1 4l3 3 5-6"/></svg>}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827', margin: '0 0 3px', lineHeight: 1.2 }}>{f.nome}</p>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px', background: cor.bg, color: cor.color }}>{f.custom ? 'extra' : 'padrão'}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {showNovaFunc ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input value={novaFuncNome} onChange={e => setNovaFuncNome(e.target.value)} placeholder="Nome da função extra..." style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFunc())} />
                <Button type="button" variant="primary" size="sm" onClick={addCustomFunc} disabled={!novaFuncNome.trim()}>Adicionar</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNovaFunc(false)}>Cancelar</Button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowNovaFunc(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '12px', color: '#6b7280', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 2v10M2 7h10"/></svg>
                Adicionar função extra a esta escala
              </button>
            )}
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isPending}>Criar escala</Button>
        </div>
      </form>
    </div>
  )
}
