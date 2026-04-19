import { notFound } from 'next/navigation'
import { buscarProgramacao } from '@/lib/programacoes/actions'
import { buscarVideosAutomaticos } from '@/lib/youtube/actions'
import { ProgramacaoEditor } from '@/components/programacoes/ProgramacaoEditor'

export default async function ProgramacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let programacao: any
  try { programacao = await buscarProgramacao(id) } catch { notFound() }
  const culto = programacao.cultos
  const videosAuto = culto ? await buscarVideosAutomaticos(culto.tipo, culto.data) : {}
  return <ProgramacaoEditor programacao={programacao} videosAuto={videosAuto} />
}
