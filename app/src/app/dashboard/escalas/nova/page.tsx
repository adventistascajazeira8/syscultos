'use client'

import React, { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, SectionCard, FormGrid, Alert, PageHeader, Select, Input } from '@/components/ui'

// 1. Definição das opções
const FUNCOES = [
  'Pregador',
  'Ancião de Dia',
  'Sonoplastia',
  'Projetor (Mídia)',
  'Transmissão',
  'Recepção',
  'Louvor',
  'Infantil'
]

// 2. Componente do Formulário (usa os hooks de busca)
function FormularioEscala() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const cultoId = searchParams.get('culto')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        console.log('Dados capturados:', Object.fromEntries(formData))
        alert('Simulação: Escala salva com sucesso!')
        router.back()
      } catch (err) {
        setError('Erro ao processar o formulário.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard title="Dados do Participante">
        <input type="hidden" name="culto_id" value={cultoId || ''} />

        <FormGrid cols={2}>
          <Input 
            label="Nome do Participante" 
            name="nome" 
            placeholder="Digite o nome" 
            required 
          />
          
          <Select label="Função" name="funcao" required>
            <option value="">Selecionar...</option>
            {FUNCOES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </FormGrid>

        <div style={{ marginTop: '16px' }}>
          <Input 
            label="Horário de Chegada" 
            name="horario_chegada" 
            type="time" 
          />
        </div>
      </SectionCard>

      {error && (
        <div style={{ marginBottom: '16px', marginTop: '16px' }}>
          <Alert type="error" message={error} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={isPending} disabled={!cultoId}>
          Confirmar Escala
        </Button>
      </div>
    </form>
  )
}

// 3. EXPORT DEFAULT (Obrigatório para o Next.js reconhecer a página)
export default function NovaEscalaPage() {
  const router = useRouter()

  return (
    <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <PageHeader 
        title="Nova Escala" 
        subtitle="Vincule um participante a este culto"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Voltar
          </Button>
        } 
      />

      <Suspense fallback={<p>Carregando formulário...</p>}>
        <FormularioEscala />
      </Suspense>
    </div>
  )
}