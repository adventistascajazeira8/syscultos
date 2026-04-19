import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.nome || user.user_metadata?.full_name

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      {/* Sidebar — desktop only */}
      <div style={{ display: 'none' }} className="md-sidebar">
        <Sidebar userEmail={user.email} userName={userName} />
      </div>
      <style>{`@media (min-width: 768px) { .md-sidebar { display: flex !important; } .mobile-pb { padding-bottom: 0 !important; } }`}</style>

      <main className="mobile-pb" style={{ flex: 1, overflowY: 'auto', paddingBottom: '56px' }}>
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <div className="mobile-nav" style={{ display: 'block' }}>
        <style>{`@media (min-width: 768px) { .mobile-nav { display: none !important; } }`}</style>
        <BottomNav />
      </div>
    </div>
  )
}
