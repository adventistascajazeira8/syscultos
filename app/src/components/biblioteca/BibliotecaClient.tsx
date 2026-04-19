'use client'
import { useState, useTransition } from 'react'
import { adicionarMusica } from '@/lib/musicas/actions'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'

const TIPOS = ['congregacional', 'especial', 'hino', 'solo', 'duo', 'coral']
const TONS  = ['—', 'Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si']

const TIPO_COR: Record<string, { bg: string; color: string }> = {
  congregacional: { bg: '#f0fdf4', color: '#15803d' },
  especial:       { bg: '#fdf2f8', color: '#9d174d' },
  hino:           { bg: '#eff6ff', color: '#1d4ed8' },
  solo:           { bg: '#fdf4ff', color: '#7e22ce' },
  duo:            { bg: '#fff7ed', color: '#c2410c' },
  coral:          { bg: '#f0fdf4', color: '#065f46' },
}

type Musica = {
  id: string; titulo: string; artista?: string; tipo?: string
  link_youtube?: string; tom?: string; vezes_usada: number; ultima_vez?: string
}

type ModalProps = {
  musica?: Musica
  onClose: () => void
  onSave: () => void
}

function MusicaModal({ musica, onClose, onSave }: ModalProps) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    titulo: musica?.titulo || '',
    artista: musica?.artista || '',
    tipo: musica?.tipo || 'congregacional',
    link_youtube: musica?.link_youtube || '',
    tom: musica?.tom || '—',
  })

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  function handleSave() {
    if (!form.titulo.trim()) return
    startTransition(async () => {
      await adicionarMusica({
        titulo: form.titulo,
        artista: form.artista || undefined,
        tipo: form.tipo,
        link_youtube: form.link_youtube || undefined,
        tom: form.tom !== '—' ? form.tom : undefined,
      })
      onSave()
      onClose()
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '460px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{musica ? 'Editar música' : 'Nova música'}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Título *</label>
            <input style={inp} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nome da música" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Artista / intérprete</label>
            <input style={inp} value={form.artista} onChange={e => setForm(f => ({ ...f, artista: e.target.value }))} placeholder="Nome do artista ou grupo" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Tipo</label>
              <select style={{ ...inp }} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Tom</label>
              <select style={{ ...inp }} value={form.tom} onChange={e => setForm(f => ({ ...f, tom: e.target.value }))}>
                {TONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Link YouTube</label>
            <input style={inp} type="url" value={form.link_youtube} onChange={e => setForm(f => ({ ...f, link_youtube: e.target.value }))} placeholder="https://youtu.be/..." />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" loading={isPending} onClick={handleSave} disabled={!form.titulo.trim()}>Salvar música</Button>
        </div>
      </div>
    </div>
  )
}

export function BibliotecaClient({ musicas: inicial }: { musicas: Musica[] }) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [modal, setModal] = useState<'nova' | Musica | null>(null)

  const filtradas = inicial.filter(m => {
    const q = busca.toLowerCase()
    const matchQ = !q || m.titulo.toLowerCase().includes(q) || (m.artista || '').toLowerCase().includes(q)
    const matchT = !tipoFiltro || m.tipo === tipoFiltro
    return matchQ && matchT
  })

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit' }

  return (
    <>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input style={{ ...inp, flex: 1, minWidth: '160px' }} placeholder="Buscar por título ou artista..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select style={{ ...inp, width: '160px' }} value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <Button variant="primary" size="sm" onClick={() => setModal('nova')}>+ Nova música</Button>
      </div>

      {/* Contador */}
      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>{filtradas.length} música{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}</p>

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>Nenhuma música encontrada</p>
          <Button variant="primary" size="sm" onClick={() => setModal('nova')}>Adicionar primeira música</Button>
        </div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.5fr) 100px 80px 60px', gap: '10px', padding: '8px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {['Título / artista', 'Grupo / ministério', 'Tipo', 'Usos', ''].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          {filtradas.map((m, i) => {
            const tc = TIPO_COR[m.tipo || ''] || { bg: '#f9fafb', color: '#374151' }
            return (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.5fr) 100px 80px 60px', gap: '10px', padding: '10px 14px', alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo}</p>
                  {m.link_youtube
                    ? <a href={m.link_youtube} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#2563eb' }}>{m.link_youtube.replace('https://', '')}</a>
                    : <span style={{ fontSize: '11px', color: '#d1d5db' }}>Sem link</span>}
                </div>
                <span style={{ fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.artista || '—'}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: tc.bg, color: tc.color, textAlign: 'center' }}>{m.tipo || '—'}</span>
                <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{m.vezes_usada}×</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setModal(m)} style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>✎</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <MusicaModal
          musica={modal === 'nova' ? undefined : modal as Musica}
          onClose={() => setModal(null)}
          onSave={() => router.refresh()}
        />
      )}
    </>
  )
}
