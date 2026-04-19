'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { gerarCultoId } from './utils'

export async function criarCulto(formData: FormData) {
  const supabase = await createClient()
  
  // Extração dos dados do formulário
  const tipo = formData.get('tipo') as string
  const data = formData.get('data') as string
  const sab_bloco_unificado = formData.get('sab_bloco_unificado') !== 'false'
  const anciao_mes = formData.get('anciao_mes') as string || null
  const ministerio = formData.get('ministerio') as string || null
  const observacao = formData.get('observacao') as string || null

  if (!tipo || !data) return { error: 'Tipo e data são obrigatórios.' }

  // GERAÇÃO DO ID (Resolvendo o ReferenceError)
  const culto_id = gerarCultoId(tipo, data)

  // Verificar duplicidade
  const { data: existente } = await supabase
    .from('cultos')
    .select('culto_id')
    .eq('culto_id', culto_id)
    .single()

  if (existente) return { error: `Já existe um culto com a ID ${culto_id}.` }

  // Inserção do Culto
  const { error } = await supabase.from('cultos').insert({ 
    culto_id, 
    tipo, 
    data, 
    sab_bloco_unificado, 
    observacao,
    status: 'rascunho' 
  })
  
  if (error) return { error: error.message }

  // Criar programação(ões) vinculada(s)
  if (tipo === 'SAB-MANHA' && !sab_bloco_unificado) {
    await supabase.from('programacoes').insert([
      { culto_id, bloco: 'Escola Sabatina', anciao_mes, ministerio_responsavel: ministerio, status: 'rascunho' },
      { culto_id, bloco: 'Culto Divino',     anciao_mes, ministerio_responsavel: ministerio, status: 'rascunho' },
    ])
  } else {
    await supabase.from('programacoes').insert({ 
      culto_id, 
      bloco: 'principal', 
      anciao_mes, 
      ministerio_responsavel: ministerio, 
      status: 'rascunho' 
    })
  }

  revalidatePath('/dashboard/cultos')
  revalidatePath('/dashboard')
  
  // Redirecionamento após sucesso
  redirect(`/dashboard/cultos/${culto_id}`)
}

export async function atualizarStatusCulto(cultoId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('cultos').update({ status }).eq('culto_id', cultoId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/cultos/${cultoId}`)
  revalidatePath('/dashboard/cultos')
  return { success: true }
}

export async function deletarCulto(cultoId: string) {
  const supabase = await createClient()
  await supabase.from('cultos').delete().eq('culto_id', cultoId)
  revalidatePath('/dashboard/cultos')
  redirect('/dashboard/cultos')
}