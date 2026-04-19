'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth/actions'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',               icon: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
  { label: 'Cultos',       href: '/dashboard/cultos',        icon: 'M2 3h12v11H2zM5 3V2M11 3V2M2 7h12' },
  { label: 'Programações', href: '/dashboard/programacoes',  icon: 'M1 2h14v13H1zM4 6h8M4 9h5M4 12h3' },
  { label: 'Músicas',      href: '/dashboard/musicas',       icon: 'M6 12V4l8-2v8M4 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M12 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0' },
  { label: 'Mídias',       href: '/dashboard/midias',        icon: 'M1 4h14v9H1zM6 7.5l4 2-4 2V7.5z' },
  { label: 'Escalas',      href: '/dashboard/escalas',       icon: 'M6 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 14c0-2.8 2.2-5 5-5M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 14c0-2.2 1.8-4 4-4' },
  { label: 'Biblioteca',   href: '/dashboard/biblioteca',    icon: 'M3 2h2v12H3zM7 2h2v12H7zM11 2l2 .5v11l-2-.5z' },
  { label: 'Sonoplastia',  href: '/dashboard/sonoplastia',   icon: 'M1 4h10v8H1zM11 6l4-2v8l-4-2' },
]

const CFG = [
  { label: 'Responsáveis',  href: '/dashboard/responsaveis',  icon: 'M8 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 14c0-3.3 2.7-6 6-6s6 2.7 6 6' },
  { label: 'Participantes', href: '/dashboard/participantes', icon: 'M6 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 14c0-2.8 2.2-5 5-5M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 14c0-2.2 1.8-4 4-4' },
  { label: 'Funções',       href: '/dashboard/funcoes',       icon: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
]

type Props = { userEmail?: string; userName?: string }

export function Sidebar({ userEmail, userName }: Props) {
  const pathname = usePathname()
  const initials = (userName || userEmail || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <aside style={{ width: '216px', flexShrink: 0, background: '#f9fafb', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>SysCultos</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Igreja Adventista</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px' }}>
        {NAV.map(item => {
          const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', fontSize: '13px', color: active ? '#1d4ed8' : '#6b7280', fontWeight: active ? 500 : 400, background: active ? '#eff6ff' : 'transparent', textDecoration: 'none', marginBottom: '1px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          )
        })}

        <div style={{ margin: '12px 0 6px', padding: '0 10px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Configurações</p>
        </div>

        {CFG.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', fontSize: '13px', color: active ? '#1d4ed8' : '#6b7280', fontWeight: active ? 500 : 400, background: active ? '#eff6ff' : 'transparent', textDecoration: 'none', marginBottom: '1px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#1d4ed8', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'Usuário'}</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', fontSize: '12px', color: '#6b7280', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l4-4-4-4M14 8H6"/>
            </svg>
            Sair da conta
          </button>
        </form>
      </div>
    </aside>
  )
}
