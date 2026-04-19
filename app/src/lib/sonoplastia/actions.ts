'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function listarProgramacoesSono(filtro?: { status?: string }) {
  const supabase = await createClient()
  let q = supabase.from('programacoes').select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`).order('updated_at', { ascending: false }).limit(30)
  if (filtro?.status) q = q.eq('status', filtro.status)
  const { data } = await q
  return (data || []).map(p => { if (p.itens_programa) p.itens_programa.sort((a: any, b: any) => a.ordem - b.ordem); return p })
}

export async function marcarConcluida(id: string) {
  const supabase = await createClient()
  await supabase.from('programacoes').update({ status: 'concluida', updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/dashboard/sonoplastia')
  return { success: true }
}

export async function registrarDisparoWpp(id: string) {
  const supabase = await createClient()
  await supabase.from('programacoes').update({ status: 'enviada', updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/dashboard/sonoplastia')
}

export async function gerarTextoWhatsApp(id: string): Promise<string> {
  const supabase = await createClient()
  const { data: prog } = await supabase.from('programacoes').select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`).eq('id', id).single()
  if (!prog) return ''
  if (prog.itens_programa) prog.itens_programa.sort((a: any, b: any) => a.ordem - b.ordem)
  const culto = prog.cultos
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Culto Divino — Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Culto de Quarta', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
  const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
