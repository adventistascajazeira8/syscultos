'use client'

import { useState, useTransition } from 'react'
// IMPORTAÇÃO CORRIGIDA AQUI
import { marcarConcluida, gerarTextoWhatsApp, registrarDisparoWpp } from '@/lib/sonoplastia/actions'
import { Button, StatusBadge } from '@/components/ui'

interface Props {
  prog: any
}

export default function SonoplastiaCard({ prog }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleWhatsApp = async () => {
    // CHAMADA CORRIGIDA AQUI
    const texto = await gerarTextoWhatsApp(prog.id)
    if (texto) {
      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
      window.open(url, '_blank')
      await registrarDisparoWpp(prog.id)
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0 }}>{prog.bloco}</h4>
          <p style={{ fontSize: '12px', color: '#666' }}>{prog.cultos?.data}</p>
        </div>
        <StatusBadge status={prog.status} />
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <Button onClick={handleWhatsApp} variant="outline">WhatsApp</Button>
        
        {prog.status !== 'concluida' && (
          <Button 
            onClick={() => startTransition(async () => { await marcarConcluida(prog.id) })}
            disabled={isPending}
          >
            {isPending ? 'Processando...' : 'Concluído'}
          </Button>
        )}
      </div>
    </div>
  )
}