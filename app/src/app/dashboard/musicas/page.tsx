import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, EmptyState } from '@/components/ui'

export default async function MusicasPage() {
  const supabase = await createClient()
  const { data: cultos } = await supabase
    .from('cultos')
    .select('culto_id, tipo, data')
    .order('data', { ascending: false })
    .limit(20)

  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader title="Músicas" subtitle="Cadastre músicas vinculadas a um culto"
        actions={<Link href="/dashboard/biblioteca" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Ver biblioteca completa →</Link>} />

      <div style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#1d4ed8', margin: '0 0 4px', fontWeight: 500 }}>Selecione um culto para cadastrar músicas</p>
        <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0 }}>As músicas ficam vinculadas ao culto e disponíveis na biblioteca para uso futuro.</p>
      </div>

      {!cultos?.length ? (
        <EmptyState title="Nenhum culto cadastrado" description="Crie um culto primeiro para vincular músicas."
          action={<Link href="/dashboard/cultos/novo" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Criar culto</Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cultos.map(c => {
            const d = new Date(c.data + 'T12:00:00')
            return (
              <Link key={c.culto_id} href={`/dashboard/musicas/nova?culto=${c.culto_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', background: 'white' }}>
                <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#15803d', lineHeight: 1 }}>{d.getDate()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{TIPO[c.tipo] || c.tipo}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>{c.culto_id}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
