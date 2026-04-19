import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { ParticipantesClient } from '@/components/escalas/ParticipantesClient'

export default async function ParticipantesPage() {
  const supabase = await createClient()
  const [{ data: participantes }, { data: funcoes }] = await Promise.all([
    supabase.from('participantes_escala').select('*, funcoes_servico(nome)').eq('ativo', true).order('nome'),
    supabase.from('funcoes_servico').select('*').eq('ativa', true).order('ordem'),
  ])
  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader title="Participantes" subtitle="Cadastro com WhatsApp para disparo de mensagens" />
      <ParticipantesClient participantes={participantes || []} funcoes={funcoes || []} />
    </div>
  )
}
