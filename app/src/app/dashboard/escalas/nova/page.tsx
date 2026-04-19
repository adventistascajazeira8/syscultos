import { createClient } from '@/lib/supabase/server'
import { listarFuncoes } from '@/lib/escalas/actions'
import { NovaEscalaForm } from '@/components/escalas/NovaEscalaForm'

export default async function NovaEscalaPage({ searchParams }: { searchParams: Promise<{ culto?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const [funcoes, { data: cultos }] = await Promise.all([
    listarFuncoes(),
    supabase.from('cultos').select('culto_id, tipo, data').order('data', { ascending: false }).limit(20),
  ])

  return <NovaEscalaForm funcoes={funcoes} cultos={cultos || []} cultoIdInicial={params.culto} />
}
