'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function buscarProgramacao(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programacoes')
    .select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`)
    .eq('id', id)
    .single()
  if (error) throw error
  if (data?.itens_programa) data.itens_programa.sort((a: any, b: any) => a.ordem - b.ordem)
  return data
}

export async function salvarProgramacao(programacaoId: string, dados: {
  anciao_mes?: string
  ministerio_responsavel?: string
  status?: string
  itens: Array<{
    tipo: string; horario?: string; atividade: string
    responsavel_item?: string; observacao?: string; ordem: number
    louvores?: Array<{ musica_id?: string; titulo_avulso?: string; link_avulso?: string; parte_culto?: string; ordem: number }>
  }>
}) {
  const supabase = await createClient()

  await supabase.from('programacoes').update({
    anciao_mes: dados.anciao_mes || null,
    ministerio_responsavel: dados.ministerio_responsavel || null,
    status: dados.status || 'rascunho',
    updated_at: new Date().toISOString(),
  }).eq('id', programacaoId)

  const { data: prog } = await supabase.from('programacoes').select('culto_id').eq('id', programacaoId).single()

  await supabase.from('itens_programa').delete().eq('programacao_id', programacaoId)

  for (const item of dados.itens) {
    const { data: novoItem } = await supabase.from('itens_programa').insert({
      programacao_id: programacaoId,
      tipo: item.tipo,
      horario: item.horario || null,
      atividade: item.atividade,
      responsavel_item: item.responsavel_item || null,
      observacao: item.observacao || null,
      ordem: item.ordem,
    }).select().single()

    if (!novoItem) continue

    if (item.louvores?.length) {
      await supabase.from('louvores').insert(
        item.louvores.map(l => ({
          culto_id: prog?.culto_id,
          item_id: novoItem.id,
          musica_id: l.musica_id || null,
          titulo_avulso: l.titulo_avulso || null,
          link_avulso: l.link_avulso || null,
          parte_culto: l.parte_culto || null,
          ordem: l.ordem,
        }))
      )
      // Incrementar uso das músicas
    for (const l of item.louvores) {
      if (l.musica_id) {
        try {
          await supabase.rpc('incrementar_uso_musica', { p_id: l.musica_id })
        } catch (err) {
          console.log('Erro silencioso ao incrementar música:', err)
        }
      }
    }
  }

  revalidatePath(`/dashboard/programacoes/${programacaoId}`)
  revalidatePath('/dashboard/sonoplastia')
  return { success: true }
}

export async function gerarWhatsAppProg(id: string): Promise<string> {
  const prog = await buscarProgramacao(id)
  if (!prog) return ''
  const culto = prog.cultos
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Culto Divino — Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Culto de Quarta', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
  const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  let msg = `🕊️ *${prog.bloco !== 'principal' ? prog.bloco.toUpperCase() : TIPO[culto.tipo] || culto.tipo}*\n`
  msg += `*${dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1)}*\n`
  if (prog.anciao_mes) msg += `*Ancião do mês: ${prog.anciao_mes}*\n`
  if (prog.ministerio_responsavel) msg += `*Ministério: ${prog.ministerio_responsavel}*\n`
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`

  for (const item of (prog.itens_programa || [])) {
    const hora = item.horario ? item.horario.slice(0, 5) : ''
    msg += hora ? `*${hora}* | *${item.atividade}*\n` : `*${item.atividade}*\n`
    if (item.responsavel_item) msg += `_${item.responsavel_item}_\n`
    for (const l of (item.louvores || []).sort((a: any, b: any) => a.ordem - b.ordem)) {
      const titulo = l.biblioteca_musicas?.titulo || l.titulo_avulso || ''
      const link = l.biblioteca_musicas?.link_youtube || l.link_avulso || ''
      if (titulo) msg += `  • ${titulo}\n`
      if (link) msg += `    ${link}\n`
    }
    if (item.observacao) msg += `_Obs: ${item.observacao}_\n`
    msg += '\n'
  }

  msg += `━━━━━━━━━━━━━━━━━━━\n_Gerado pelo SysCultos_`
  return msg
}
