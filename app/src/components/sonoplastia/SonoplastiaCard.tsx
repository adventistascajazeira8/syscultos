'use client'
import { useState, useTransition } from 'react'
import { marcarConcluida, gerarTextoWhatsApp, registrarDisparoWpp } from '@/lib/sonoplastia/actions'
import { Button, StatusBadge } from '@/components/ui'

const TIPO: Record<string, string> = { 'SAB-MANHA': 'Sábado manhã', 'SAB-TARDE': 'Culto Jovem', 'DOM': 'Domingos Especiais', 'QUA': 'Quarta — Oração', 'BATISMO': 'Batismo', 'SEM-ORACAO': 'Semana de Oração' }

export function SonoplastiaCard({ prog }: { prog: any }) {
  const culto = prog.cultos
  const [exp, setExp] = useState(false)
  const [wpp, setWpp] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const itens = (prog.itens_programa || []).sort((a: any, b: any) => a.ordem - b.ordem)
  const totalMusicas = itens.reduce((acc: number, i: any) => acc + (i.louvores?.length || 0), 0)
  const dataFmt = culto ? new Date(culto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'
  const nomeProg = prog.bloco !== 'principal' ? prog.bloco : (TIPO[culto?.tipo] || 'Programação')

  const borderColor: Record<string, string> = { rascunho: '#e5e7eb', publicada: '#bfdbfe', enviada: '#bbf7d0', concluida: '#f3f4f6' }

  return (
    <>
      <div style={{ border: `1px solid ${borderColor[prog.status] || '#e5e7eb'}`, borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', padding: '14px 16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{nomeProg}</p>
              <StatusBadge status={prog.status} />
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px', fontFamily: 'monospace' }}>{culto?.culto_id}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{dataFmt}{prog.ministerio_responsavel && ` · ${prog.ministerio_responsavel}`}{prog.anciao_mes && ` · Anc. ${prog.anciao_mes}`} · {itens.length} itens · {totalMusicas} música(s)</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => setExp(!exp)}>{exp ? 'Recolher' : 'Exibir'}</Button>
            <Button variant="secondary" size="sm" loading={isPending} onClick={() => startTransition(async () => setWpp(await gerarTextoWhatsApp(prog.id)))}>WhatsApp</Button>
            <Button variant="secondary" size="sm" onClick={() => window.open(`/api/programacao/${prog.id}/word`, '_blank')}>Word</Button>
            {prog.status !== 'concluida'
              ? <Button variant="primary" size="sm" loading={isPending} onClick={() => startTransition(async () => marcarConcluida(prog.id))}>Concluído</Button>
              : <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Concluído</span>}
          </div>
        </div>

        {exp && (
          <div style={{ borderTop: '1px solid #f3f4f6', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', width: '60px' }}>Horário</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Atividade</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Responsável</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Obs.</th>
              </tr></thead>
              <tbody>
                {itens.map((item: any) => {
                  const louvores = (item.louvores || []).sort((a: any, b: any) => a.ordem - b.ordem)
                  return (
                    <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#6b7280', verticalAlign: 'top' }}>{item.horario?.slice(0, 5) || '—'}</td>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{item.atividade}</p>
                        {louvores.map((l: any) => {
                          const titulo = l.biblioteca_musicas?.titulo || l.titulo_avulso || ''
                          const link = l.biblioteca_musicas?.link_youtube || l.link_avulso || ''
                          return (
                            <div key={l.id} style={{ marginTop: '4px' }}>
                              <span style={{ color: '#374151' }}>♪ {titulo}</span>
                              {link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#2563eb', fontSize: '11px', wordBreak: 'break-all' }}>{link}</a>}
                            </div>
                          )
                        })}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', verticalAlign: 'top' }}>{item.responsavel_item || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#9ca3af', verticalAlign: 'top', fontSize: '11px' }}>{item.observacao || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {itens.length === 0 && <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '20px', margin: 0 }}>Nenhum item cadastrado.</p>}
          </div>
        )}
      </div>

      {wpp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>Pré-visualização — WhatsApp</p>
              <button onClick={() => setWpp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ padding: '14px', maxHeight: '55vh', overflowY: 'auto' }}>
              <pre style={{ fontSize: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, color: '#111827', margin: 0 }}>{wpp}</pre>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => navigator.clipboard.writeText(wpp!)} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Copiar texto</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => setWpp(null)}>Fechar</Button>
                <Button variant="primary" size="sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(wpp!)}`, '_blank'); startTransition(async () => registrarDisparoWpp(prog.id)); setWpp(null) }}>Abrir no WhatsApp</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
