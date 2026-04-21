import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Header, 
  Footer, 
  PageNumber,
  HeadingLevel 
} from 'docx';

// Se tiveres constantes de cores, define-as aqui ou importa-as
const COR_HD = '444444'; 

export async function gerarDocumentoWord(id: string) {
  // Nota: Aqui deve estar a tua lógica de procurar os dados no Supabase/Banco
  // conforme o ID que recebes.

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ 
                    text: 'Igreja Adventista do Sétimo Dia — SysCultos', 
                    color: '888888', 
                    size: 16, 
                    font: 'Calibri' 
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ 
                    text: "Página ", 
                    size: 16, 
                    color: '888888', 
                    font: 'Calibri' 
                  }),
                  // CORREÇÃO DEFINITIVA: PageNumber dentro de um TextRun
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '888888',
                    font: 'Calibri',
                  }),
                  new TextRun({ 
                    text: " de ", 
                    size: 16, 
                    color: '888888', 
                    font: 'Calibri' 
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '888888',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Exemplo de conteúdo do corpo do documento
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ 
                text: 'PROGRAMAÇÃO DO CULTO', 
                size: 28, 
                font: 'Calibri', 
                bold: true,
                color: COR_HD 
              })
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ 
                text: `ID: ${id}`, 
                size: 18, 
                font: 'Calibri', 
                color: '666666' 
              })
            ],
          }),
          // Adiciona aqui o restante da tua lógica de itens_programa.map(...)
        ],
      },
    ],
  });

  // Retorna o buffer para ser usado no Route Handler (API)
  return await Packer.toBuffer(doc);
}