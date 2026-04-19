'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarCulto } from '@/lib/cultos/actions'
import { gerarCultoId } from '@/lib/cultos/utils'
import { Button, SectionCard, FormGrid, Alert, PageHeader, Select, Input, Textarea } from '@/components/ui'

const TIPOS = [
  { value: 'SAB-MANHA',  label: 'Sábado manhã' },
  { value: 'SAB-TARDE',  label: 'Culto Jovem (Sáb tarde)' },
  { value: 'DOM',        label: 'Domingos Especiais' },
  { value: 'QUA',        label: 'Quarta — 10 dias de oração' },
  { value: 'BATISMO',    label: 'Batismo' },
  { value: 'SEM-ORACAO', label: 'Semana de Oração' },
]

const MINISTERIOS = ['Diretoria Geral', 'Ministério Alegria', 'Ministério Jovem', 'Ministério da Mulher', 'Desbravadores', 'Aventureiros', 'Escola Sabatina']

export default function NovoCultoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState('')
  const [data, setData] = useState('')
  const [blocos, setBlocos] = useState(false)

  // Geração reativa do ID para exibição na tela
  const cultoIdExibicao = tipo && data ? gerarCultoId(tipo, data) : null
  const isSab = tipo === 'SAB-MANHA'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const r = await criarCulto(fd)
      if (r?.error) setError(r.error)
    })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <PageHeader 
        title="Novo culto" 
        subtitle="Preencha os dados para criar a programação"
        actions={<Button variant="ghost" size="sm" onClick={() => router.back()}>Cancelar</Button>} 
      />

      <form onSubmit={handleSubmit}>
        <SectionCard title="Identificação do culto">
          <FormGrid cols={2}>
            <Select 
              label="Tipo de culto" 
              name="tipo" 
              required 
              value={tipo} 
              onChange={e => { 
                setTipo(e.target.value); 
                if (e.target.value !== 'SAB-MANHA') setBlocos(false) 
              }}
            >
              <option value="">Selecionar...</option>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input 
              label="Data" 
              name="data" 
              type="date" 
              required 
              value={data} 
              onChange={e => setData(e.target.value)} 
            />
          </FormGrid>

          {cultoIdExibicao && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '12px', marginTop: '12px' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#16a34a" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
              <span style={{ fontSize: '12px', color: '#15803d' }}>ID gerada:</span>
              <code style={{ fontSize: '12px', fontWeight: 600, color: '#14532d' }}>{cultoIdExibicao}</code>
            </div>
          )}

          {isSab && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', marginTop: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>Blocos separados</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Ative se ministérios diferentes conduzem ES e CD</p>
              </div>
              <div 
                onClick={() => setBlocos(!blocos)}
                style={{ width: '40px', height: '22px', borderRadius: '11px', background: blocos ? '#2563eb' : '#d1d5db', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}
              >
                <span style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: 'white', top: '2px', left: blocos ? '20px' : '2px', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
              {/* O valor enviado ao servidor depende do estado 'blocos' */}
              <input type="hidden" name="sab_bloco_unificado" value={String(!blocos)} />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Responsáveis">
          <FormGrid cols={2}>
            <Input label="Ancião do mês" name="anciao_mes" placeholder="Nome do ancião" />
            <Select label="Ministério responsável" name="ministerio">
              <option value="">Selecionar...</option>
              {MINISTERIOS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
          </FormGrid>
        </SectionCard>

        <SectionCard title="Observação">
          <Textarea name="observacao" placeholder="Informações gerais sobre o culto (opcional)" rows={2} />
        </SectionCard>

        {error && <div style={{ marginBottom: '16px' }}><Alert type="error" message={error} /></div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isPending} disabled={!tipo || !data}>
            Criar culto
          </Button>
        </div>
      </form>
    </div>
  )
}