'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function criarParticipante(formData: FormData) {
  const supabase = await createClient()
  const nome      = formData.get('nome') as string
  const whatsapp  = formData.get('whatsapp') as string
  const ministerio = formData.get('ministerio') as string || null
  const funcao_id  = formData.get('funcao_id') as string || null

  if (!nome || !whatsapp) return { error: 'Nome e WhatsApp são obrigatórios.' }

  const { error } = await supabase.from('participantes_escala').insert({
    nome: nome.trim(),
    whatsapp: whatsapp.replace(/\D/g, '').replace(/^/, '+'),
    ministerio: ministerio || null,
    funcao_id: funcao_id || null,
    ativo: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/participantes')
  return { success: true }
}
