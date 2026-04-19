import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, Button, EmptyState } from '@/components/ui'

export default async function MidiasPage() {
  const supabase = await createClient()
  const { data: midias } = await supabase.from('midias').select('*, cultos(tipo, data)').order('created_at', { ascending: false }).limit(30)
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Dom. Especiais', 'QUA': 'Quarta', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Sem. Oração' }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Mídias" subtitle="Vídeos, imagens e apresentações"
        actions={<Link href="/dashboard/midias/nova"><Button variant="primary" size="sm">+ Enviar mídia</Button></Link>} />
      {!midias?.length ? (
        <EmptyState title="Nenhuma mídia enviada" description="Envie vídeos, imagens ou apresentações vinculados aos cultos."
          action={<Link href="/dashboard/midias/nova"><Button variant="primary" size="sm">Enviar primeira mídia</Button></Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {midias.map(m => {
            const culto = m.cultos as any
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
                <div style={{ width: '36px', height: '36px', background: '#fffbeb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#92400e" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><path d="M6 7.5l4 2-4 2V7.5z" fill="#92400e" stroke="none"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo || 'Sem título'}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                    {m.tipo_midia && <span style={{ marginRight: '8px' }}>{m.tipo_midia}</span>}
                    {culto && <span>{TIPO[culto.tipo] || culto.tipo} — {new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                  </p>
                </div>
                {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', flexShrink: 0 }}>Abrir</a>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
