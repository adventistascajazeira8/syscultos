import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType, ShadingType, Header, Footer, PageNumber } from 'docx'
import { createClient } from '@/lib/supabase/server'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Culto Divino — Sábado Manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Culto de Quarta', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }
const COR_HD = '1E3A5F'; const COR_MUS = 'EAF3DE'; const COR_VID = 'FFF3CD'; const COR_ORA = 'F3E8FF'; const COR_SER = 'F1F5F9'; const COR_BR = 'FFFFFF'

function corTipo(tipo: string) { if (['musica','especial'].includes(tipo)) return COR_MUS; if (tipo === 'video') return COR_VID; if (tipo === 'oracao') return COR_ORA; if (tipo === 'sermao') return COR_SER; return COR_BR }

function cel(texto: string, { bold = false, cor = '1a1a1a', fundo, w, center = false, small = false }: { bold?: boolean; cor?: string; fundo?: string; w?: number; center?: boolean; small?: boolean } = {}): TableCell {
  return new TableCell({
    width: w ? { size: w, type: WidthType.PERCENTAGE } : undefined,
    shading: fundo ? { type: ShadingType.CLEAR, fill: fundo } : undefined,
    borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: texto, bold, color: cor, size: small ? 18 : 20, font: 'Calibri' })] })],
  })
}

export async function gerarDocumentoWord(programacaoId: string): Promise<Buffer> {
  const supabase = await createClient()
  const { data: prog } = await supabase.from('programacoes').select(`*, cultos(*), itens_programa(*, louvores(*, biblioteca_musicas(*)))`).eq('id', programacaoId).single()
  if (!prog) throw new Error('Programação não encontrada')
  if (prog.itens_programa) prog.itens_programa.sort((a: any, b: any) => a.ordem - b.ordem)

  const culto = prog.cultos
  const titulo = prog.bloco !== 'principal' ? prog.bloco : (TIPO[culto.tipo] || culto.tipo)
  const dataFmt = new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [cel('Horário', { bold: true, cor: 'FFFFFF', fundo: COR_HD, w: 12, center: true }), cel('Atividade', { bold: true, cor: 'FFFFFF', fundo: COR_HD, w: 34 }), cel('Responsável', { bold: true, cor: 'FFFFFF', fundo: COR_HD, w: 27 }), cel('Observação', { bold: true, cor: 'FFFFFF', fundo: COR_HD, w: 27 })] }),
  ]

  for (const item of (prog.itens_programa || [])) {
    const hora = item.horario ? item.horario.slice(0, 5) : '—'
    const cor = corTipo(item.tipo)
    rows.push(new TableRow({ children: [cel(hora, { fundo: cor, center: true }), cel(item.atividade, { fundo: cor, bold: true }), cel(item.responsavel_item || '—', { fundo: cor }), cel(item.observacao || '', { fundo: cor, small: true })] }))
    for (const l of (item.louvores || []).sort((a: any, b: any) => a.ordem - b.ordem)) {
      const nome = l.biblioteca_musicas?.titulo || l.titulo_avulso || ''
      const link = l.biblioteca_musicas?.link_youtube || l.link_avulso || ''
      rows.push(new TableRow({ children: [cel('', { fundo: COR_BR }), cel(`  ♪ ${nome}${link ? '  ' + link : ''}`, { fundo: COR_BR, cor: '1D6FA3', small: true }), cel('', { fundo: COR_BR }), cel('', { fundo: COR_BR })] }))
    }
  }

  const doc = new Document({
    sections: [{
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Igreja Adventista do Sétimo Dia — SysCultos', color: '888888', size: 16, font: 'Calibri' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Página ', size: 16, color: '888888', font: 'Calibri' }), new TextRun({
    children: [PageNumber.CURRENT], }) ] })] }) },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: titulo.toUpperCase(), bold: true, size: 28, font: 'Calibri', color: COR_HD })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1), size: 22, font: 'Calibri', color: '444444' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [...(prog.anciao_mes ? [new TextRun({ text: `Ancião do mês: ${prog.anciao_mes}`, bold: true, size: 20, font: 'Calibri', color: '333333' })] : []), ...(prog.anciao_mes && prog.ministerio_responsavel ? [new TextRun({ text: '   |   ', size: 20, font: 'Calibri', color: '888888' })] : []), ...(prog.ministerio_responsavel ? [new TextRun({ text: `Ministério: ${prog.ministerio_responsavel}`, bold: true, size: 20, font: 'Calibri', color: '333333' })] : [])] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
        new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200 }, children: [new TextRun({ text: `Gerado pelo SysCultos em ${new Date().toLocaleDateString('pt-BR')}`, size: 16, color: 'AAAAAA', font: 'Calibri' })] }),
      ],
    }],
  })

  return await Packer.toBuffer(doc)
}
