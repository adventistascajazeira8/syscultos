'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Alert } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const TIPOS_MIDIA = ['Vídeo', 'Imagem', 'Apresentação (PPT)', 'Documento PDF', 'Outro']
const ITENS_PROG  = ['Sermão / Mensagem', 'Provai e Vede', 'Verdade Seja Dita', 'Escola Sabatina', 'Outro item']

export default function NovaMidiaPage() {
  const router = useRouter()
  const params = useSearchParams()
  const cultoId = params.get('culto') || ''
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [modo, setModo] = useState<'upload' | 'link'>('upload')
  const [form, setForm] = useState({ tipo_midia: 'Vídeo', titulo: '', item_vinculado: 'Sermão / Mensagem', ministerio_origem: '', observacao: '', url: '' })

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.titulo.trim()) { setError('Título é obrigatório.'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('midias').insert({
        culto_id: cultoId || null,
        tipo_midia: form.tipo_midia,
        titulo: form.titulo.trim(),
        url: form.url || null,
        ministerio_origem: form.ministerio_origem || null,
        observacao: form.observacao || null,
      })
      if (err) { setError(err.message); return }
      setSuccess(true)
      setTimeout(() => { setSuccess(false); if (cultoId) router.push(`/dashboard/cultos/${cultoId}`) }, 1500)
    })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontFamily: 'inherit' }}>← Voltar</button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Enviar mídia</h1>
      </div>

      {cultoId && (
        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>Vinculada ao culto: <strong style={{ fontFamily: 'monospace' }}>{cultoId}</strong></p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Identificação</p>
          </div>
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Tipo de mídia</label><select style={inp} value={form.tipo_midia} onChange={e => upd('tipo_midia', e.target.value)}>{TIPOS_MIDIA.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Título / descrição *</label><input style={inp} value={form.titulo} onChange={e => upd('titulo', e.target.value)} placeholder="Ex: Slides do sermão" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Vinculada ao item</label><select style={inp} value={form.item_vinculado} onChange={e => upd('item_vinculado', e.target.value)}>{ITENS_PROG.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Ministério de origem</label><input style={inp} value={form.ministerio_origem} onChange={e => upd('ministerio_origem', e.target.value)} placeholder="Ministério que envia" /></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Instrução para a sonoplastia</label><input style={inp} value={form.observacao} onChange={e => upd('observacao', e.target.value)} placeholder="Ex: Exibir antes do sermão..." /></div>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Origem da mídia</p>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {(['upload', 'link'] as const).map(m => (
                <div key={m} onClick={() => setModo(m)}
                  style={{ padding: '12px', border: modo === m ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: modo === m ? '#eff6ff' : 'white' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{m === 'upload' ? 'Fazer upload' : 'Link externo'}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{m === 'upload' ? 'Enviar do dispositivo' : 'YouTube, Drive, Dropbox...'}</p>
                </div>
              ))}
            </div>

            {modo === 'upload' ? (
              <div style={{ border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>Arraste o arquivo aqui ou clique para selecionar</p>
                <Button variant="secondary" size="sm">Selecionar arquivo</Button>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '8px 0 0' }}>MP4, MOV, JPG, PNG, PPTX, PDF — máx. 500 MB</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>URL da mídia</label>
                <input style={inp} type="url" value={form.url} onChange={e => upd('url', e.target.value)} placeholder="https://youtu.be/... ou drive.google.com/..." />
              </div>
            )}
          </div>
        </div>

        {error   && <Alert type="error"   message={error} />}
        {success && <Alert type="success" message="Mídia enviada com sucesso!" />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button variant="primary" loading={isPending} onClick={handleSave} disabled={!form.titulo.trim()}>Enviar mídia</Button>
        </div>
      </div>
    </div>
  )
}
