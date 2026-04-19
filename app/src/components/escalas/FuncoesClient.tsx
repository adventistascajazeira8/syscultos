'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Alert } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const CORES = ['verde', 'azul', 'roxo', 'ambar', 'coral', 'rosa', 'teal', 'cinza']
const COR_MAP: Record<string, { bg: string; color: string }> = {
  verde:  { bg: '#f0fdf4', color: '#15803d' },
  azul:   { bg: '#eff6ff', color: '#1d4ed8' },
  roxo:   { bg: '#f5f3ff', color: '#6d28d9' },
  ambar:  { bg: '#fffbeb', color: '#92400e' },
  coral:  { bg: '#fff1f2', color: '#be123c' },
  rosa:   { bg: '#fdf2f8', color: '#9d174d' },
  teal:   { bg: '#f0fdfa', color: '#0f766e' },
  cinza:  { bg: '#f9fafb', color: '#374151' },
}

type Funcao = { id: string; nome: string; tipo: string; cor: string; ativa: boolean; ordem: number }

export function FuncoesClient({ funcoes }: { funcoes: Funcao[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('cinza')

  const padrao = funcoes.filter(f => f.tipo === 'padrao')
  const custom  = funcoes.filter(f => f.tipo === 'personalizada')

  async function criarFuncao() {
    if (!nome.trim()) return
    const supabase = createClient()
    const { error: err } = await supabase.from('funcoes_servico').insert({ nome: nome.trim(), tipo: 'personalizada', cor, ordem: 99, ativa: true })
    if (err) { setError(err.message); return }
    setNome(''); setCor('cinza')
    router.refresh()
  }

  const inp = { padding: '8px 10px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%' }

  function FuncaoRow({ f }: { f: Funcao }) {
    const c = COR_MAP[f.cor] || COR_MAP.cinza
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: c.bg, color: c.color }}>{f.nome}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>{f.tipo === 'padrao' ? 'Padrão' : 'Personalizada'}</span>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Funções padrão do sistema</p>
        {padrao.map(f => <FuncaoRow key={f.id} f={f} />)}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Funções personalizadas</p>
        {custom.length > 0 ? custom.map(f => <FuncaoRow key={f.id} f={f} />) : <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 12px' }}>Nenhuma função personalizada criada.</p>}
      </div>

      <div style={{ border: '1px dashed #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>Criar nova função</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Nome da função</label>
            <input style={inp} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Portaria, Louvor..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>Cor</label>
            <select style={inp} value={cor} onChange={e => setCor(e.target.value)}>
              {CORES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>
        {cor && nome && <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: COR_MAP[cor]?.bg, color: COR_MAP[cor]?.color, marginBottom: '12px' }}>Prévia: {nome}</div>}
        {error && <div style={{ marginBottom: '10px' }}><Alert type="error" message={error} /></div>}
        <Button variant="primary" size="sm" loading={isPending} disabled={!nome.trim()} onClick={criarFuncao}>Criar função</Button>
      </div>
    </>
  )
}
