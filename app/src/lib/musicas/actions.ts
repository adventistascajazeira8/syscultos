'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function buscarMusicas(query?: string, tipo?: string) {
  const supabase = await createClient()
  let q = supabase.from('biblioteca_musicas').select('*').order('vezes_usada', { ascending: false }).limit(50)
  if (query) q = q.ilike('titulo', `%${query}%`)
  if (tipo) q = q.eq('tipo', tipo)
  const { data } = await q
  return data || []
}

export async function adicionarMusica(dados: { titulo: string; artista?: string; tipo?: string; link_youtube?: string; tom?: string }) {
  const supabase = await createClient()
  const { data: existente } = await supabase.from('biblioteca_musicas').select('id').ilike('titulo', dados.titulo.trim()).maybeSingle()
  if (existente) return { id: existente.id, existente: true }
  const { data, error } = await supabase.from('biblioteca_musicas').insert({
    titulo: dados.titulo.trim(),
    artista: dados.artista || null,
    tipo: dados.tipo || 'congregacional',
    link_youtube: dados.link_youtube || null,
    tom: dados.tom || null,
    vezes_usada: 0,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/dashboard/biblioteca')
  return { id: data.id, existente: false }
}
