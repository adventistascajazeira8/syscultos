'use client'
import { useState, useTransition } from 'react'
import { atualizarStatusCulto, deletarCulto } from '@/lib/cultos/actions'
import { Button } from '@/components/ui'

const NEXT: Record<string, { label: string; next: string }> = {
  rascunho:  { label: 'Publicar',        next: 'publicada' },
  publicada: { label: 'Marcar enviada',  next: 'enviada'   },
  enviada:   { label: 'Concluir',        next: 'concluida' },
  concluida: { label: 'Reabrir',         next: 'rascunho'  },
}

export function StatusActions({ cultoId, status }: { cultoId: string; status: string }) {
  const [showDel, setShowDel] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDel] = useTransition()
  const next = NEXT[status]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {next && <Button variant="primary" size="sm" loading={isPending} onClick={() => startTransition(async () => { await atualizarStatusCulto(cultoId, next.next) })}>{next.label}</Button>}
      {!showDel
        ? <Button variant="ghost" size="sm" onClick={() => setShowDel(true)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V2h4v2M5 4l1 9h4l1-9"/></svg>
          </Button>
        : <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#dc2626' }}>Excluir?</span>
            <button onClick={() => startDel(async () => { await deletarCulto(cultoId) })} disabled={isDeleting} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>{isDeleting ? '...' : 'Sim'}</button>
            <button onClick={() => setShowDel(false)} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Não</button>
          </div>}
    </div>
  )
}
