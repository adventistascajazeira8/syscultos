'use client'
import { useState, useCallback, useTransition } from 'react'
import { salvarProgramacao, gerarWhatsAppProg } from '@/lib/programacoes/actions'
import { buscarMusicas, adicionarMusica } from '@/lib/musicas/actions'
import { Button, Alert } from '@/components/ui'

type Louvor = { _key: string; musica_id?: string; titulo_avulso?: string; link_avulso?: string; parte_culto?: string; ordem: number; titulo_display: string; link_display: string }
type Item = { _key: string; id?: string; tipo: string; horario: string; atividade: string; responsavel_item: string; observacao: string; ordem: number; louvores: Louvor[]; expandido: boolean }
type VideoAuto = { titulo: string; url: string } | null

const TIPOS = [
  { value: 'musica',    label: 'Música / Cânticos', cor: '#f0fdf4', corTxt: '#15803d' },
  { value: 'especial',  label: 'Música especial',   cor: '#fdf2f8', corTxt: '#9d174d' },
  { value: 'oracao',    label: 'Oração / Bênção',   cor: '#f5f3ff', corTxt: '#6d28d9' },
  { value: 'video',     label: 'Vídeo / Mídia',     cor: '#fffbeb', corTxt: '#92400e' },
  { value: 'sermao',    label: 'Sermão',             cor: '#f9fafb', corTxt: '#374151' },
  { value: 'atividade', label: 'Atividade',          cor: '#eff6ff', corTxt: '#1d4ed8' },
]
const TIPO_MAP = Object.fromEntries(TIPOS.map(t => [t.value, t]))
const mk = () => Math.random().toString(36).slice(2)

function itemNovo(tipo: string, ordem: number, videoAuto?: VideoAuto): Item {
  const louvores: Louvor[] = videoAuto ? [{ _key: mk(), titulo_avulso: videoAuto.titulo, link_avulso: videoAuto.url, parte_culto: tipo, ordem: 0, titulo_display: videoAuto.titulo, link_display: videoAuto.url }] : []
  const atividades: Record<string, string> = { musica: 'Serviço de Cânticos', especial: 'Música Especial', oracao: 'Oração / Bênção', video: 'Vídeo', sermao: 'Sermão / Mensagem', atividade: 'Atividade' }
  return { _key: mk(), tipo, horario: '', atividade: atividades[tipo] || 'Atividade', responsavel_item: '', observacao: '', ordem, louvores, expandido: true }
}

function MusicSearch({ onSelect }: { onSelect: (m: { id?: string; titulo: string; link: string }) => void }) {
  const [q, setQ] = useState(''); const [res, setRes] = useState<any[]>([]); const [buscando, setBuscando] = useState(false)
  const [nova, setNova] = useState(false); const [novoTit, setNovoTit] = useState(''); const [novoLnk, setNovoLnk] = useState('')

  async function buscar(v: string) {
    setQ(v)
    if (v.length < 2) { setRes([]); return }
    setBuscando(true)
    try { setRes(await buscarMusicas(v)) } finally { setBuscando(false) }
  }

  async function salvarNova() {
    if (!novoTit.trim()) return
    const r = await adicionarMusica({ titulo: novoTit, link_youtube: novoLnk || undefined })
    onSelect({ id: r.id, titulo: novoTit, link: novoLnk })
    setNova(false); setNovoTit(''); setNovoLnk(''); setQ(''); setRes([])
  }

  const inp = { padding: '7px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '6px', padding: '8px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <input style={{ ...inp, flex: 1 }} value={q} onChange={e => buscar(e.target.value)} placeholder="Buscar na biblioteca..." />
        <button type="button" onClick={() => setNova(!nova)} style={{ ...inp, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' }}>+ Nova</button>
      </div>
      {nova && (
        <div style={{ padding: '10px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input style={{ ...inp, width: '100%' }} value={novoTit} onChange={e => setNovoTit(e.target.value)} placeholder="Título da música *" />
          <input style={{ ...inp, width: '100%' }} value={novoLnk} onChange={e => setNovoLnk(e.target.value)} placeholder="Link YouTube (opcional)" />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" onClick={salvarNova} style={{ padding: '5px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Salvar e adicionar</button>
            <button type="button" onClick={() => setNova(false)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: 'white', color: '#374151' }}>Cancelar</button>
          </div>
        </div>
      )}
      {buscando && <p style={{ fontSize: '12px', color: '#9ca3af', padding: '8px 12px', margin: 0 }}>Buscando...</p>}
      {res.length > 0 && (
        <ul style={{ maxHeight: '160px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
          {res.map(m => (
            <li key={m.id}>
              <button type="button" onClick={() => { onSelect({ id: m.id, titulo: m.titulo, link: m.link_youtube || '' }); setQ(''); setRes([]) }}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', textAlign: 'left' }}>
                <div><p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 1px' }}>{m.titulo}</p>{m.artista && <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{m.artista}</p>}</div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{m.vezes_usada}×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.length >= 2 && res.length === 0 && !buscando && <p style={{ fontSize: '12px', color: '#9ca3af', padding: '8px 12px', margin: 0 }}>Nenhum resultado. Use "+ Nova".</p>}
    </div>
  )
}

function ItemCard({ item, index, total, onChange, onRemove, onMove }: { item: Item; index: number; total: number; onChange: (k: string, u: Partial<Item>) => void; onRemove: (k: string) => void; onMove: (k: string, d: 'up' | 'down') => void }) {
  const [showSearch, setShowSearch] = useState(false)
  const cfg = TIPO_MAP[item.tipo] || TIPO_MAP.atividade
  const temMusica = ['musica', 'especial'].includes(item.tipo)
  const temVideo = item.tipo === 'video'

  function addLouvor(m: { id?: string; titulo: string; link: string }) {
    const l: Louvor = { _key: mk(), musica_id: m.id, titulo_avulso: m.id ? undefined : m.titulo, link_avulso: m.id ? undefined : m.link, parte_culto: item.atividade, ordem: item.louvores.length, titulo_display: m.titulo, link_display: m.link }
    onChange(item._key, { louvores: [...item.louvores, l] })
    setShowSearch(false)
  }

  const inp = { padding: '7px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f9fafb', cursor: 'pointer' }} onClick={() => onChange(item._key, { expandido: !item.expandido })}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} onClick={e => e.stopPropagation()}>
          <button type="button" disabled={index === 0} onClick={() => onMove(item._key, 'up')} style={{ width: '18px', height: '18px', background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: '#9ca3af', fontSize: '10px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(item._key, 'down')} style={{ width: '18px', height: '18px', background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: '#9ca3af', fontSize: '10px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: cfg.cor, color: cfg.corTxt, flexShrink: 0 }}>{cfg.label}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.horario && <span style={{ color: '#9ca3af', fontFamily: 'monospace', marginRight: '6px' }}>{item.horario.slice(0, 5)}</span>}
          {item.atividade || 'Sem título'}
        </span>
        {item.louvores.length > 0 && <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{item.louvores.length}♪</span>}
        <button type="button" onClick={e => { e.stopPropagation(); onRemove(item._key) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '14px', padding: '0 2px', display: 'flex', alignItems: 'center' }}>✕</button>
        <span style={{ fontSize: '10px', color: '#9ca3af', transform: item.expandido ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▼</span>
      </div>

      {item.expandido && (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Horário</label><input type="time" value={item.horario} onChange={e => onChange(item._key, { horario: e.target.value })} style={inp} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Atividade</label><input type="text" value={item.atividade} onChange={e => onChange(item._key, { atividade: e.target.value })} style={inp} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Responsável</label><input type="text" value={item.responsavel_item} onChange={e => onChange(item._key, { responsavel_item: e.target.value })} placeholder="Nome ou ministério" style={inp} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Observação</label><input type="text" value={item.observacao} onChange={e => onChange(item._key, { observacao: e.target.value })} placeholder="Instrução para a sonoplastia" style={inp} /></div>

          {(temMusica || temVideo) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>{temMusica ? 'Músicas' : 'Vídeos / links'}</span>
                <button type="button" onClick={() => setShowSearch(!showSearch)} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Adicionar</button>
              </div>
              {item.louvores.map(l => (
                <div key={l._key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '6px 8px', background: '#f9fafb', borderRadius: '6px', marginBottom: '4px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.titulo_display}</p>
                    <input type="url" value={l.link_display} onChange={e => onChange(item._key, { louvores: item.louvores.map(x => x._key === l._key ? { ...x, link_display: e.target.value, link_avulso: e.target.value } : x) })} placeholder="https://youtu.be/..." style={{ ...inp, fontSize: '11px', color: '#2563eb', padding: '4px 7px' }} />
                  </div>
                  <button type="button" onClick={() => onChange(item._key, { louvores: item.louvores.filter(x => x._key !== l._key) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', marginTop: '2px' }}>✕</button>
                </div>
              ))}
              {showSearch && (
                temVideo ? (
                  <div style={{ display: 'flex', gap: '6px', padding: '8px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <input type="url" placeholder="Cole o link do YouTube..." style={{ flex: 1, padding: '7px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#111827', outline: 'none' }}
                      onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value) { addLouvor({ titulo: 'Vídeo', link: e.currentTarget.value }); e.currentTarget.value = '' } }} />
                    <button type="button" onClick={() => setShowSearch(false)} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : <MusicSearch onSelect={addLouvor} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ProgramacaoEditor({ programacao, videosAuto }: { programacao: any; videosAuto: any }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [wppText, setWppText] = useState<string | null>(null)
  const [anciao, setAnciao] = useState(programacao.anciao_mes || '')
  const [ministerio, setMinisterio] = useState(programacao.ministerio_responsavel || '')

  const [itens, setItens] = useState<Item[]>(() => {
    const ex = programacao.itens_programa || []
    if (ex.length > 0) return ex.map((i: any): Item => ({ _key: mk(), id: i.id, tipo: i.tipo, horario: i.horario || '', atividade: i.atividade, responsavel_item: i.responsavel_item || '', observacao: i.observacao || '', ordem: i.ordem, expandido: false, louvores: (i.louvores || []).map((l: any): Louvor => ({ _key: mk(), musica_id: l.musica_id, titulo_avulso: l.titulo_avulso, link_avulso: l.link_avulso, parte_culto: l.parte_culto, ordem: l.ordem, titulo_display: l.biblioteca_musicas?.titulo || l.titulo_avulso || '', link_display: l.biblioteca_musicas?.link_youtube || l.link_avulso || '' })) }))
    const base: Item[] = [itemNovo('oracao', 0), itemNovo('musica', 1)]
    if (videosAuto.provai_vede) base.push(itemNovo('video', base.length, videosAuto.provai_vede))
    if (videosAuto.verdade_seja_dita) base.push(itemNovo('video', base.length, videosAuto.verdade_seja_dita))
    if (videosAuto.informativo_mundial) base.push(itemNovo('video', base.length, videosAuto.informativo_mundial))
    base.push(itemNovo('sermao', base.length), itemNovo('musica', base.length), itemNovo('oracao', base.length))
    return base
  })

  const update = useCallback((k: string, u: Partial<Item>) => setItens(p => p.map(i => i._key === k ? { ...i, ...u } : i)), [])
  const remove = useCallback((k: string) => setItens(p => p.filter(i => i._key !== k).map((i, n) => ({ ...i, ordem: n }))), [])
  const move   = useCallback((k: string, dir: 'up' | 'down') => setItens(p => { const idx = p.findIndex(i => i._key === k); if (idx < 0) return p; const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1; if (si < 0 || si >= n.length) return p; [n[idx], n[si]] = [n[si], n[idx]]; return n.map((i, x) => ({ ...i, ordem: x })) }), [])
  const add    = useCallback((tipo: string) => setItens(p => [...p, { ...itemNovo(tipo, p.length), expandido: true }]), [])

  async function salvar(status: string) {
    setError(null); setSuccess(false)
    startTransition(async () => {
      const r = await salvarProgramacao(programacao.id, { anciao_mes: anciao, ministerio_responsavel: ministerio, status, itens: itens.map((item, idx) => ({ tipo: item.tipo, horario: item.horario || undefined, atividade: item.atividade, responsavel_item: item.responsavel_item || undefined, observacao: item.observacao || undefined, ordem: idx, louvores: item.louvores.map((l, li) => ({ musica_id: l.musica_id, titulo_avulso: l.titulo_avulso || l.titulo_display, link_avulso: l.link_display || l.link_avulso, parte_culto: l.parte_culto || item.atividade, ordem: li })) })) })
      if (r.error) setError(r.error); else setSuccess(true)
    })
  }

  const culto = programacao.cultos
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  return (
    <div style={{ padding: '20px', maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{programacao.bloco === 'principal' ? TIPO[culto?.tipo] || 'Programação' : programacao.bloco}</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{culto && new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={async () => setWppText(await gerarWhatsAppProg(programacao.id))}>WhatsApp</Button>
          <Button variant="secondary" size="sm" onClick={() => salvar('rascunho')} loading={isPending}>Salvar rascunho</Button>
          <Button variant="primary" size="sm" onClick={() => salvar('publicada')} loading={isPending}>Publicar</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Ancião do mês</label><input value={anciao} onChange={e => setAnciao(e.target.value)} placeholder="Nome do ancião" style={inp} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>Ministério responsável</label><input value={ministerio} onChange={e => setMinisterio(e.target.value)} placeholder="Nome do ministério" style={inp} /></div>
      </div>

      {error   && <div style={{ marginBottom: '12px' }}><Alert type="error"   message={error} /></div>}
      {success && <div style={{ marginBottom: '12px' }}><Alert type="success" message="Programação salva com sucesso!" /></div>}

      <div style={{ marginBottom: '10px' }}>
        {itens.map((item, idx) => <ItemCard key={item._key} item={item} index={idx} total={itens.length} onChange={update} onRemove={remove} onMove={move} />)}
      </div>

      <div style={{ border: '1px dashed #e5e7eb', borderRadius: '10px', padding: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', margin: '0 0 8px' }}>Adicionar item</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TIPOS.map(t => <button key={t.value} type="button" onClick={() => add(t.value)} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: t.cor, color: t.corTxt, border: 'none', cursor: 'pointer' }}>+ {t.label}</button>)}
        </div>
      </div>

      {wppText && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>Pré-visualização — WhatsApp</p>
              <button onClick={() => setWppText(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ padding: '14px', maxHeight: '55vh', overflowY: 'auto' }}>
              <pre style={{ fontSize: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, color: '#111827', margin: 0 }}>{wppText}</pre>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
              <Button variant="secondary" size="sm" onClick={() => setWppText(null)}>Fechar</Button>
              <Button variant="primary" size="sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(wppText)}`, '_blank'); setWppText(null) }}>Abrir no WhatsApp</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
