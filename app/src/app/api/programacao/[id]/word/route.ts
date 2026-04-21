import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gerarDocumentoWord } from '@/lib/documentos/gerador-word'

// Ajustei o tipo do params para garantir compatibilidade total com o Next.js 15+
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const buffer = await gerarDocumentoWord(id)

    // CORREÇÃO AQUI: Envolver o buffer em new Uint8Array()
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="programacao-${id.slice(0, 8)}.docx"`,
      },
    })
  } catch (e) {
    console.error('Erro ao gerar documento:', e)
    return NextResponse.json({ error: 'Erro ao gerar documento' }, { status: 500 })
  }
}