import { describe, expect, it } from 'vitest'
import { IMAGEM_DA_PISTA, PROFISSOES } from './profissoes'

const PISTAS = PROFISSOES.flatMap((p) => p.pistas)

describe('as pistas das profissões', () => {
  it('cada profissão tem 3 pistas, e cada pista só existe numa profissão', () => {
    for (const p of PROFISSOES) expect(p.pistas).toHaveLength(3)
    expect(new Set(PISTAS).size).toBe(PISTAS.length)
  })

  it('cada pista tem o nome da sua imagem, e não há imagens repetidas', () => {
    for (const pista of PISTAS) expect(IMAGEM_DA_PISTA[pista], pista).toBeTruthy()
    const nomes = PISTAS.map((p) => IMAGEM_DA_PISTA[p])
    expect(new Set(nomes).size).toBe(nomes.length)
  })
})
