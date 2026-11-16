import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sons } from '../../data/sons.json'

// Confirma que a lista de sons está bem preenchida (se faltar algo, o teste avisa)
describe('sons.json', () => {
  it('cada som tem todos os campos', () => {
    for (const som of sons) {
      expect(som.id).toMatch(/^[a-z]+$/)
      expect(som.nome).toBeTruthy()
      expect(som.emoji).toBeTruthy()
      expect(['animais', 'natureza', 'cidade']).toContain(som.categoria)
      expect(som.ficheiro).toMatch(/\.mp3$/)
      expect(som.parecidos).toBeTruthy()
    }
  })

  it('não há ids repetidos', () => {
    const ids = sons.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada ficheiro de áudio existe em src/assets/sons/memoria/', () => {
    for (const som of sons) {
      const caminho = new URL(`../../assets/sons/memoria/${som.ficheiro}`, import.meta.url)
      expect(existsSync(caminho), som.ficheiro).toBe(true)
    }
  })

  it('não há dois ficheiros de áudio iguais (sons trocados ou copiados)', () => {
    const conteudos = sons.map((som) =>
      readFileSync(new URL(`../../assets/sons/memoria/${som.ficheiro}`, import.meta.url)).toString('base64'),
    )
    expect(new Set(conteudos).size).toBe(sons.length)
  })

  it('cada grupo de parecidos tem pelo menos 2 sons', () => {
    const contagem = {}
    for (const som of sons) contagem[som.parecidos] = (contagem[som.parecidos] ?? 0) + 1
    for (const [grupo, quantos] of Object.entries(contagem)) {
      expect(quantos, grupo).toBeGreaterThanOrEqual(2)
    }
  })

  it('há sons suficientes para 8 imagens diferentes', () => {
    expect(sons.length).toBeGreaterThanOrEqual(8)
  })
})
