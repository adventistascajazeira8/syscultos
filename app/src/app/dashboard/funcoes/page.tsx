import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { FuncoesClient } from '@/components/escalas/FuncoesClient'

export default async function FuncoesPage() {
  const supabase = await createClient()
  const { data: funcoes } = await supabase.from('funcoes_servico').select('*').order('ordem')
  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <PageHeader title="Funções de serviço" subtitle="Gerencie as funções disponíveis para escala" />
      <FuncoesClient funcoes={funcoes || []} />
    </div>
  )
}
