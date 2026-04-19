'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adicionarMusica } from '@/lib/musicas/actions'
import { Button, Alert } from '@/components/ui'

const TIPOS = ['congregacional', 'especial', 'hino', 'solo', 'duo', 'coral']
const TONS  = ['—', 'Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si']
const PARTES = ['Serviço de Cânticos', 'Música Especial', 'Hino de encerramento', 'Louvor pós-mensagem', 'Escola Sabatina', 'Outra parte']

export default function NovaMusicaPage() {
  const router = useRouter()
  const params = useSearchParams()
  const cultoId = params.get('culto') || ''
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [salvarBib, setSalvarBib] = useState(true)
  const [form, setForm] = useState({ titulo: '', artista: '', tipo: 'congregacional', tom: '—', link_youtube: '', parte: 'Serviço de Cânticos', cifra_url: '' })

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.titulo.trim()) { setError('Título é obrigatório.'); return }
    setError(null)
    startTransition(async () => {
      if (salvarBib) {
        await adicionarMusica({ titulo: form.titulo, artista: form.artista || undefined, tipo: form.tipo, link_youtube: form.link_youtube || undefined, tom: form.tom !== '—' ? form.tom : undefined })
      }
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setForm({ titulo: '', artista: '', tipo: 'congregacional', tom: '—', link_youtube: '', parte: 'Serviço de Cânticos', cifra_url: '' }) }, 1500)
    })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>← Voltar</button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Cadastrar música</h1>
      </div>

      {cultoId && (
        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>Vinculada ao culto: <strong style={{ fontFamily: 'monospace' }}>{cultoId}</strong></p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Dados da música</p>
          </div>
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Título *</label>
                <input style={inp} value={form.titulo} onChange={e => upd('titulo', e.target.value)} placeholder="Nome da música" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Artista / intérprete</label>
                <input style={inp} value={form.artista} onChange={e => upd('artista', e.target.value)} placeholder="Nome do artista" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Tipo</label>
                <select style={inp} value={form.tipo} onChange={e => upd('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Tom</label>
                <select style={inp} value={form.tom} onChange={e => upd('tom', e.target.value)}>
                  {TONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Parte do culto</label>
                <select style={inp} value={form.parte} onChange={e => upd('parte', e.target.value)}>
                  {PARTES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Links</p>
          </div>
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Link YouTube</label>
              <input style={inp} type="url" value={form.link_youtube} onChange={e => upd('link_youtube', e.target.value)} placeholder="https://youtu.be/..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Cifra / letra (link opcional)</label>
              <input style={inp} type="url" value={form.cifra_url} onChange={e => upd('cifra_url', e.target.value)} placeholder="https://cifraclub.com/..." />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>Adicionar à biblioteca</p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Ficará disponível para buscas em programações futuras</p>
          </div>
          <div onClick={() => setSalvarBib(!salvarBib)}
            style={{ width: '40px', height: '22px', borderRadius: '11px', background: salvarBib ? '#2563eb' : '#d1d5db', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
            <span style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: 'white', top: '2px', left: salvarBib ? '20px' : '2px', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        {error   && <Alert type="error"   message={error} />}
        {success && <Alert type="success" message="Música salva com sucesso!" />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button variant="primary" loading={isPending} onClick={handleSave} disabled={!form.titulo.trim()}>Salvar música</Button>
        </div>
      </div>
    </div>
  )
}
