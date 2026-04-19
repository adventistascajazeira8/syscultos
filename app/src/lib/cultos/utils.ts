// src/lib/cultos/utils.ts

export function gerarCultoId(tipo: string, data: string, bloco?: string): string {
  if (!tipo || !data) return '';

  // Ajuste para evitar problemas de fuso horário na data vinda do input
  const d = new Date(data + 'T12:00:00');
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  
  let id = `${tipo}-${ano}${mes}${dia}`;
  if (bloco) id += `-${bloco}`;
  
  return id.toUpperCase();
}