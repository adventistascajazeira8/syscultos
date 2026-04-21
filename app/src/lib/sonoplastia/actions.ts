'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function listarProgramacoesSono(filtro?: { status?: string }) {
  const supabase = await createClient()
  let q = supabase
    .from('programacoes')
    .select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (filtro?.status) q = q.eq('status', filtro.status)
  const { data } = await q
  
  return (data || []).map(p => { 
    if (p.itens_programa) p.itens_programa.sort((a: any, b: any) => a.ordem - b.ordem)
    return p 
  })
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
  return { success: true }
}

// NOME PADRONIZADO AQUI
export async function gerarTextoWhatsApp(id: string): Promise<string> {
  const supabase = await createClient()
  const { data: prog } = await supabase
    .from('programacoes')
    .select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`)
    .eq('id', id)
    .single()

  if (!prog || !prog.cultos) return ''
  
  const culto = prog.cultos as any
  const TIPO: Record<string, string> = { 'SAB-MANHA': 'Culto Divino', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingo', 'QUA': 'Quarta' }
  const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

  let msg = `*${TIPO[culto.tipo] || 'Programação'} - ${dataFmt}*\n\n`
  
  for (const item of (prog.itens_programa || []).sort((a: any, b: any) => a.ordem - b.ordem)) {
    msg += `*${item.horario?.slice(0, 5) || ''}* | ${item.atividade}\n`
  }
  
  return msg
}