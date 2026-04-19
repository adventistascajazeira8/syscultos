import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { BibliotecaClient } from '@/components/biblioteca/BibliotecaClient'

export default async function BibliotecaPage() {
  const supabase = await createClient()
  const { data: musicas } = await supabase
    .from('biblioteca_musicas')
    .select('*')
    .order('vezes_usada', { ascending: false })

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Biblioteca de músicas"
        subtitle="Acervo completo da igreja"
      />
      <BibliotecaClient musicas={musicas || []} />
    </div>
  )
}
