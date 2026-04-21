'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Função auxiliar para buscar a programação (necessária para as outras funções)
async function buscarProgramacao(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('programacoes')
    .select(`*, cultos(*)`)
    .eq('id', id)
    .single()
  return data
}

export async function salvarProgramacao(id: string, dados: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('programacoes')
    .update({
      anciao_mes: dados.anciao_mes,
      ministerio_responsavel: dados.ministerio_responsavel,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath(`/dashboard/programacoes/${id}`)
  return { success: true }
}

// Esta é a função que estava dando erro na linha 82
export async function gerarWhatsAppProg(id: string): Promise<string> {
  try {
    const prog = await buscarProgramacao(id)
    if (!prog) return ''

    const culto = prog.cultos as any
    const TIPO: Record<string, string> = { 
      'SAB-MANHA': 'Culto Divino', 
      'SAB-TARDE': 'Culto Jovem', 
      'DOM': 'Domingo', 
      'QUA': 'Quarta' 
    }

    const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    })

    let msg = `*${TIPO[culto.tipo] || 'Programação'} - ${dataFmt}*\n`
    if (prog.anciao_mes) msg += `Ancião: ${prog.anciao_mes}\n`
    
    return msg
  } catch (e) {
    console.error(e)
    return ''
  }
}