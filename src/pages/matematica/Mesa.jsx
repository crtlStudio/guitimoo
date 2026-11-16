import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useRef, useState } from 'react'
import { prepararEfeitos, tocarEfeito } from '../../audio/efeitos'
import { baralhar, espalharNoMonte } from '../../games/matematica/monte'
import Balanca from './Balanca'
import { DISTANCIA_NO_MONTE, CUBINHO, ZONAS_DO_MONTE } from './medidas'
import Cubinho, { CubinhoNoAr } from './Cubinho'

/**
 * Os cubinhos de uma ronda: cada um tem um id, uma cor e um lugar no chão
 * (o seu "cantinho", para onde volta quando sai do prato). As cores e os
 * lugares são sorteados: cada ronda começa com os cubinhos espalhados de
 * outra maneira.
 * - cores: quantos de cada cor no chão, ex.: { verde: 3, laranja: 3, azul: 3 }
 * - inicial: os que já começam no prato esquerdo, ex.: { quantos: 9, cor: 'azul' }
 *   (também têm um cantinho no chão, para onde vão se a criança os tirar)
 */
function cubinhosIniciais(cores, inicial) {
  const noPrato = Array(inicial?.quantos ?? 0).fill(inicial?.cor ?? 'azul')
  const noChao = baralhar(Object.entries(cores).flatMap(([cor, n]) => Array(n).fill(cor)))
  const lista = [...noPrato, ...noChao]
  const lugares = espalharNoMonte(lista.length, ZONAS_DO_MONTE, { distancia: DISTANCIA_NO_MONTE })
  return lista.map((cor, i) => ({
    id: `cubinho-${i}`,
    cor,
    noMonte: lugares[i], // para onde volta quando sai do prato
    lugar: i < noPrato.length ? 'esquerda' : 'monte', // 'monte' ou 'esquerda'
    chegada: i < noPrato.length ? i - noPrato.length : 0, // ordem de chegada ao prato (para os arrumar por ordem)
  }))
}

/** Quanto tempo fica o balãozinho com a contagem, depois de pôr ou tirar um cubinho (ms). */
const DURACAO_CONTAGEM = 2000
/** Quanto tempo fica, no início, quando o prato já começa com cubinhos (ms). */
const DURACAO_INICIAL = 5000

/**
 * Onde é que o cubinho foi largado: primeiro vê o prato que está debaixo
 * do dedo; se não houver nenhum, aceita um prato em que o cubinho toque
 * (mais fácil para dedos pequenos).
 */
function ondeLargou(argumentos) {
  const debaixoDoDedo = pointerWithin(argumentos)
  return debaixoDoDedo.length > 0 ? debaixoDoDedo : rectIntersection(argumentos)
}

/**
 * A "mesa" do jogo de Matemática, igual em todas as idades: a balança, os cubinhos
 * no chão e o arrasto. Os cubinhos só entram no prato ESQUERDO; o prato
 * direito mostra um número (ou fica vazio).
 *
 * Props:
 * - cores: quantos cubinhos de cada cor há no chão
 * - inicial: os que já começam no prato esquerdo ({ quantos, cor }), opcional
 * - numeroDireita: o número no prato direito (null = vazio)
 * - pintas: mostrar pintas por baixo do número (3–4 anos)
 * - bloqueada: true = já não se pode arrastar (ex.: depois de acertar)
 * - festejar: true = a balança salta de alegria
 * - porCubinho: quanto mexe um braço por cada cubinho (DESCIDA_POR_CUBINHO da idade)
 * - aoMudar(quantos, porCor): avisa quantos cubinhos ficaram no prato esquerdo
 *   (e quantos de cada cor, ex.: { azul: 2, verde: 3 }),
 *   sempre que esse número muda
 *
 * Para começar uma ronda nova, a página muda o `key` da Mesa: tudo recomeça.
 */
function Mesa({ cores, inicial = null, numeroDireita = null, pintas = false, bloqueada = false, festejar = false, porCubinho, aoMudar }) {
  const [cubinhos, setCubinhos] = useState(() => cubinhosIniciais(cores, inicial))
  const [aArrastar, setAArrastar] = useState(null) // o cubinho que está no dedo
  const chegadas = useRef(0) // conta as chegadas ao prato
  // Balãozinho com quantos cubinhos há no prato. Se o prato já começa com
  // cubinhos (subtração, número que falta), mostra-os logo, durante mais tempo.
  const [contagem, setContagem] = useState(() =>
    inicial?.quantos ? { numero: inicial.quantos, vez: 1, duracao: DURACAO_INICIAL } : null,
  )

  // Arrastar com o dedo ou o rato (só começa depois de mexer 4px, para um
  // toque rápido não contar como arrasto) e também com o teclado
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  // Os cubinhos do prato esquerdo, pela ordem em que chegaram
  const noPrato = cubinhos.filter((s) => s.lugar === 'esquerda').sort((a, b) => a.chegada - b.chegada)

  function aoComecar({ active }) {
    prepararEfeitos() // carrega os sons no primeiro toque
    setAArrastar(cubinhos.find((s) => s.id === active.id))
  }

  function aoLargar({ active, over }) {
    setAArrastar(null)
    const destino = over?.id === 'esquerda' ? 'esquerda' : 'monte' // fora do prato = cai para o chão
    const cubinho = cubinhos.find((s) => s.id === active.id)
    if (!cubinho) return
    if (destino === 'esquerda' && cubinho.lugar === 'esquerda') return // largou no mesmo prato: fica igual

    if (destino === 'monte') {
      tocarEfeito('cair') // largado fora do prato: cai para o chão (volta ao seu lugar)
    } else {
      tocarEfeito('cubinho') // posto no prato
      chegadas.current += 1
    }
    const chegada = chegadas.current
    setCubinhos((todos) => todos.map((s) => (s.id === active.id ? { ...s, lugar: destino, chegada } : s)))

    // Se o prato mudou: mostra a contagem nova e avisa a página de quantos ficaram lá
    // (e de quantos há de cada cor: na soma, cada número tem a sua cor)
    if (destino !== cubinho.lugar) {
      const depois = cubinhos.map((s) => (s.id === active.id ? { ...s, lugar: destino } : s)).filter((s) => s.lugar === 'esquerda')
      const porCor = {}
      for (const s of depois) porCor[s.cor] = (porCor[s.cor] ?? 0) + 1
      setContagem((c) => ({ numero: depois.length, vez: (c?.vez ?? 0) + 1, duracao: DURACAO_CONTAGEM }))
      aoMudar?.(depois.length, porCor)
    }
  }

  // Os do chão, de trás para a frente: os mais à frente ficam por cima
  const noMonte = cubinhos.filter((s) => s.lugar === 'monte').sort((a, b) => a.noMonte.y - b.noMonte.y)

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={ondeLargou}
      onDragStart={aoComecar}
      onDragEnd={aoLargar}
      onDragCancel={() => setAArrastar(null)}
    >
      <Balanca
        pratos={{ esquerda: noPrato, direita: [] }}
        numeroDireita={numeroDireita}
        pintas={pintas}
        bloqueada={bloqueada}
        festejar={festejar}
        contagem={contagem}
        porCubinho={porCubinho}
      />

      {/* O chão: cada cubinho no seu lugar da relva */}
      {noMonte.map((s) => (
        <Cubinho
          key={s.id}
          id={s.id}
          cor={s.cor}
          tamanho={CUBINHO.noMonte}
          x={s.noMonte.x}
          y={s.noMonte.y}
          bloqueado={bloqueada}
          lugar="chao"
        />
      ))}

      {/* A cópia que segue o dedo enquanto se arrasta (fica por cima de tudo) */}
      <DragOverlay dropAnimation={null}>{aArrastar && <CubinhoNoAr cor={aArrastar.cor} />}</DragOverlay>
    </DndContext>
  )
}

export default Mesa
