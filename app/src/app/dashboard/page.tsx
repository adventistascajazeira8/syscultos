import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
const STATUS_COR: Record<string, { bg: string; color: string }> = { rascunho: { bg: '#f3f4f6', color: '#374151' }, publicada: { bg: '#eff6ff', color: '#1d4ed8' }, enviada: { bg: '#f0fdf4', color: '#15803d' }, concluida: { bg: '#f9fafb', color: '#9ca3af' } }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: totalCultos }, { count: totalMusicas }, { count: totalEscalas }, { data: proximos }] = await Promise.all([
    supabase.from('cultos').select('*', { count: 'exact', head: true }),
    supabase.from('biblioteca_musicas').select('*', { count: 'exact', head: true }),
    supabase.from('escalas').select('*', { count: 'exact', head: true }),
    supabase.from('cultos').select('*').gte('data', new Date().toISOString().split('T')[0]).order('data').limit(4),
  ])

  const nome = user?.user_metadata?.nome || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{saudacao}, {nome.split(' ')[0]}</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Cultos cadastrados',  value: totalCultos  ?? 0, color: '#2563eb', href: '/dashboard/cultos' },
          { label: 'Músicas na biblioteca', value: totalMusicas ?? 0, color: '#16a34a', href: '/dashboard/biblioteca' },
          { label: 'Escalas criadas',     value: totalEscalas ?? 0, color: '#7c3aed', href: '/dashboard/escalas' },
          { label: 'Próximos cultos',     value: proximos?.length ?? 0, color: '#d97706', href: '/dashboard/cultos' },
        ].map(card => (
          <Link key={card.label} href={card.href} style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', textDecoration: 'none', display: 'block' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 600, color: card.color, margin: 0 }}>{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>Ações rápidas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { label: 'Novo culto',        href: '/dashboard/cultos/novo' },
            { label: 'Cadastrar música',  href: '/dashboard/musicas/nova' },
            { label: 'Nova escala',       href: '/dashboard/escalas/nova' },
            { label: 'Enviar mídia',      href: '/dashboard/midias/nova' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#374151', textDecoration: 'none', background: 'white' }}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Próximos cultos */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>Próximos cultos</p>
          <Link href="/dashboard/cultos" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>Ver todos</Link>
        </div>

        {proximos && proximos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {proximos.map(c => {
              const d = new Date(c.data + 'T12:00:00')
              const sc = STATUS_COR[c.status] || STATUS_COR.rascunho
              return (
                <Link key={c.culto_id} href={`/dashboard/cultos/${c.culto_id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', background: 'white' }}>
                  <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1d4ed8', lineHeight: 1 }}>{d.getDate()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{TIPO[c.tipo] || c.tipo}</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>{c.culto_id}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px', background: sc.bg, color: sc.color }}>{c.status}</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>Nenhum culto próximo cadastrado</p>
            <Link href="/dashboard/cultos/novo" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Cadastrar primeiro culto</Link>
          </div>
        )}
      </div>
    </div>
  )
}
