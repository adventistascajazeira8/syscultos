'use server'

export type VideoEncontrado = { titulo: string; url: string; canal?: string }

export async function buscarVideosAutomaticos(tipoCulto: string, dataCulto: string): Promise<{
  provai_vede?: VideoEncontrado | null
  verdade_seja_dita?: VideoEncontrado | null
  informativo_mundial?: VideoEncontrado | null
}> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const temProvai  = ['SAB-MANHA', 'QUA', 'DOM'].includes(tipoCulto)
  const temVerdade = ['SAB-MANHA', 'QUA', 'DOM'].includes(tipoCulto)
  const temInfo    = tipoCulto === 'SAB-MANHA'

  if (!apiKey) {
    const d = new Date(dataCulto + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const url = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' ' + d)}`
    return {
      provai_vede:        temProvai  ? { titulo: 'Provai e Vede — buscar no YouTube',            url: url('Provai e Vede adventista') }          : null,
      verdade_seja_dita:  temVerdade ? { titulo: 'Verdade Seja Dita — buscar no YouTube',         url: url('Verdade Seja Dita adventista') }        : null,
      informativo_mundial: temInfo   ? { titulo: 'Informativo Mundial — buscar no YouTube',      url: url('Informativo Mundial Missões Escola Sabatina') } : null,
    }
  }

  async function buscar(query: string): Promise<VideoEncontrado | null> {
    try {
      const d = new Date(dataCulto + 'T12:00:00')
      const semAnt = new Date(d); semAnt.setDate(d.getDate() - 7)
      const params = new URLSearchParams({ part: 'snippet', q: query, type: 'video', order: 'date', publishedAfter: semAnt.toISOString(), publishedBefore: new Date(d.getTime() + 86400000).toISOString(), maxResults: '3', key: apiKey, relevanceLanguage: 'pt' })
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { next: { revalidate: 3600 } })
      if (!res.ok) return null
      const json = await res.json()
      const item = json.items?.[0]
      if (!item?.id?.videoId) return null
      return { titulo: item.snippet?.title || query, url: `https://youtu.be/${item.id.videoId}`, canal: item.snippet?.channelTitle }
    } catch { return null }
  }

  const [provai, verdade, info] = await Promise.all([
    temProvai  ? buscar('Provai e Vede adventista')                    : null,
    temVerdade ? buscar('Verdade Seja Dita adventista')                 : null,
    temInfo    ? buscar('Informativo Mundial Missões Escola Sabatina') : null,
  ])
  return { provai_vede: provai, verdade_seja_dita: verdade, informativo_mundial: info }
}
