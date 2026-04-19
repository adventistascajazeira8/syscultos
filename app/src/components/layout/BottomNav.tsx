'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { label: 'Cultos',    href: '/dashboard/cultos',       icon: 'M2 3h12v11H2zM5 3V2M11 3V2M2 7h12' },
  { label: 'Músicas',   href: '/dashboard/musicas',      icon: 'M6 12V4l8-2v8M4 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0' },
  { label: 'Escalas',   href: '/dashboard/escalas',      icon: 'M6 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 14c0-2.8 2.2-5 5-5' },
  { label: 'Sono',      href: '/dashboard/sonoplastia',  icon: 'M1 4h10v8H1zM11 6l4-2v8l-4-2' },
  { label: 'Menu',      href: '/dashboard',              icon: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: '56px', background: 'white', borderTop: '1px solid #e5e7eb', zIndex: 100 }}>
      {ITEMS.map(item => {
        const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', fontSize: '10px', fontWeight: 500, color: active ? '#2563eb' : '#9ca3af', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={item.icon}/>
            </svg>
            {item.label}
            {active && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563eb' }} />}
          </Link>
        )
      })}
    </nav>
  )
}
