import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Header, 
  Footer, 
  PageNumber, // Certifique-se de que PageNumber está sendo importado aqui
  HeadingLevel 
} from 'docx';

// ... (seus outros imports ou constantes como COR_HD)

export async function gerarDocumentoWord(id: string) {
  // ... (sua lógica de busca de dados/programação)

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
                  // CORREÇÃO AQUI: Removido o "new" e os parênteses "()"
                  PageNumber.CURRENT, 
                  new TextRun({ 
                    text: " de ", 
                    size: 16, 
                    color: '888888', 
                    font: 'Calibri' 
                  }),
                  PageNumber.TOTAL_PAGES
                ],
              }),
            ],
          }),
        },
        children: [
          // ... (restante do conteúdo do documento: Títulos, tabelas, etc.)
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ 
                text: 'Título da Programação', 
                size: 28, 
                font: 'Calibri', 
                color: '444444' 
              })
            ],
          }),
          // ...
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}