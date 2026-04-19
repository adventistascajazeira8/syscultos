import { notFound } from 'next/navigation'
import { buscarEscala, listarParticipantes, gerarWhatsAppEscala } from '@/lib/escalas/actions'
import { EscalaDetalhe } from '@/components/escalas/EscalaDetalhe'

export default async function EscalaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let escala: any
  try { escala = await buscarEscala(id) } catch { notFound() }

  const participantes = await listarParticipantes()

  return <EscalaDetalhe escala={escala} participantes={participantes} />
}
