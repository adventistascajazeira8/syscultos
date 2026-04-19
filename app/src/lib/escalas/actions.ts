'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function listarFuncoes() {
  const supabase = await createClient()
  const { data } = await supabase.from('funcoes_servico').select('*').eq('ativa', true).order('ordem')
  return data || []
}

export async function listarParticipantes(funcaoId?: string) {
  const supabase = await createClient()
  let q = supabase.from('participantes_escala').select('*, funcoes_servico(nome)').eq('ativo', true).order('nome')
  if (funcaoId) q = q.eq('funcao_id', funcaoId)
  const { data } = await q
  return data || []
}

export async function listarEscalas() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('escalas')
    .select(`*, cultos(tipo, data), escala_funcoes(*, funcoes_servico(*), escalados(*, participantes_escala(*)))`)
    .order('data_escala', { ascending: false })
    .limit(20)
  return data || []
}

export async function buscarEscala(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('escalas')
    .select(`*, cultos(*), escala_funcoes(*, funcoes_servico(*), escalados(*, participantes_escala(*)))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function criarEscala(formData: FormData) {
  const supabase = await createClient()
  const culto_id   = formData.get('culto_id') as string || null
  const data_escala = formData.get('data_escala') as string
  const ministerio  = formData.get('ministerio') as string || null
  const observacao  = formData.get('observacao') as string || null
  const funcoesJson = formData.get('funcoes') as string

  if (!data_escala) return { error: 'Data é obrigatória.' }

  const { data: escala, error } = await supabase
    .from('escalas')
    .insert({ culto_id, data_escala, ministerio, observacao, status: 'rascunho' })
    .select()
    .single()

  if (error) return { error: error.message }

  // Criar escala_funcoes
  const funcoes: Array<{ funcao_id?: string; nome_custom?: string; ordem: number }> = JSON.parse(funcoesJson || '[]')
  if (funcoes.length > 0) {
    await supabase.from('escala_funcoes').insert(
      funcoes.map(f => ({ escala_id: escala.id, funcao_id: f.funcao_id || null, nome_custom: f.nome_custom || null, ordem: f.ordem }))
    )
  }

  revalidatePath('/dashboard/escalas')
  redirect(`/dashboard/escalas/${escala.id}`)
}

export async function adicionarEscalado(escalaFuncaoId: string, participanteId: string) {
  const supabase = await createClient()
  await supabase.from('escalados').insert({ escala_funcao_id: escalaFuncaoId, participante_id: participanteId })
  revalidatePath('/dashboard/escalas')
  return { success: true }
}

export async function removerEscalado(escaladoId: string) {
  const supabase = await createClient()
  await supabase.from('escalados').delete().eq('id', escaladoId)
  revalidatePath('/dashboard/escalas')
  return { success: true }
}

export async function gerarWhatsAppEscala(escalaId: string): Promise<string> {
  const escala = await buscarEscala(escalaId)
  if (!escala) return ''
  const culto = escala.cultos
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
  const dataFmt = new Date(escala.data_escala + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  let msg = `🕊️ *ESCALA DE SERVIÇO*\n`
  if (culto) msg += `*${TIPO[culto.tipo] || culto.tipo}*\n`
  msg += `*${dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1)}*\n`
  if (escala.ministerio) msg += `*Ministério: ${escala.ministerio}*\n`
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`

  const funcoes = (escala.escala_funcoes || []).sort((a: any, b: any) => a.ordem - b.ordem)
  for (const ef of funcoes) {
    const nomeFuncao = ef.funcoes_servico?.nome || ef.nome_custom || 'Função'
    msg += `*${nomeFuncao}*\n`
    for (const e of (ef.escalados || [])) {
      msg += `· ${e.participantes_escala?.nome || '—'}\n`
    }
    msg += '\n'
  }

  msg += `━━━━━━━━━━━━━━━━━━━\n_Confirme sua presença respondendo esta mensagem._`
  return msg
}
