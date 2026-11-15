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
import { baralhar, espalharNoMonte } from '../../games/sapo/monte'
import Balanca from './Balanca'
import { DISTANCIA_NO_MONTE, SAPINHO, ZONAS_DO_MONTE } from './medidas'
import Sapinho, { SapinhoNoAr } from './Sapinho'

/**
 * Os sapinhos de uma ronda: cada um tem um id, uma cor e um lugar no chão
 * (o seu "cantinho", para onde volta quando sai do prato). As cores e os
 * lugares são sorteados: cada ronda começa com os sapinhos espalhados de
 * outra maneira.
 * - cores: quantos de cada cor no chão, ex.: { verde: 3, laranja: 3, azul: 3 }
 * - inicial: os que já começam no prato esquerdo, ex.: { quantos: 9, cor: 'azul' }
 *   (também têm um cantinho no chão, para onde vão se a criança os tirar)
 */
function sapinhosIniciais(cores, inicial) {
  const noPrato = Array(inicial?.quantos ?? 0).fill(inicial?.cor ?? 'azul')
  const noChao = baralhar(Object.entries(cores).flatMap(([cor, n]) => Array(n).fill(cor)))
  const lista = [...noPrato, ...noChao]
  const lugares = espalharNoMonte(lista.length, ZONAS_DO_MONTE, { distancia: DISTANCIA_NO_MONTE })
  return lista.map((cor, i) => ({
    id: `sapinho-${i}`,
    cor,
    noMonte: lugares[i], // para onde volta quando sai do prato
    lugar: i < noPrato.length ? 'esquerda' : 'monte', // 'monte' ou 'esquerda'
    chegada: i < noPrato.length ? i - noPrato.length : 0, // ordem de chegada ao prato (para os arrumar por ordem)
  }))
}

/** Quanto tempo fica o balãozinho com a contagem, depois de pôr ou tirar um sapinho (ms). */
const DURACAO_CONTAGEM = 2000
/** Quanto tempo fica, no início, quando o prato já começa com sapinhos (ms). */
const DURACAO_INICIAL = 5000

/**
 * Onde é que o sapinho foi largado: primeiro vê o prato que está debaixo
 * do dedo; se não houver nenhum, aceita um prato em que o sapinho toque
 * (mais fácil para dedos pequenos).
 */
function ondeLargou(argumentos) {
  const debaixoDoDedo = pointerWithin(argumentos)
  return debaixoDoDedo.length > 0 ? debaixoDoDedo : rectIntersection(argumentos)
}

/**
 * A "mesa" do jogo do Sapo, igual em todas as idades: a balança, os sapinhos
 * no chão e o arrasto. Os sapinhos só entram no prato ESQUERDO; o prato
 * direito mostra um número (ou fica vazio).
 *
 * Props:
 * - cores: quantos sapinhos de cada cor há no chão
 * - inicial: os que já começam no prato esquerdo ({ quantos, cor }), opcional
 * - numeroDireita: o número no prato direito (null = vazio)
 * - pintas: mostrar pintas por baixo do número (3–4 anos)
 * - bloqueada: true = já não se pode arrastar (ex.: depois de acertar)
 * - festejar: true = o sapo grande salta de alegria
 * - aoMudar(quantos): avisa quantos sapinhos ficaram no prato esquerdo,
 *   sempre que esse número muda
 *
 * Para começar uma ronda nova, a página muda o `key` da Mesa: tudo recomeça.
 */
function Mesa({ cores, inicial = null, numeroDireita = null, pintas = false, bloqueada = false, festejar = false, aoMudar }) {
  const [sapinhos, setSapinhos] = useState(() => sapinhosIniciais(cores, inicial))
  const [aArrastar, setAArrastar] = useState(null) // o sapinho que está no dedo
  const chegadas = useRef(0) // conta as chegadas ao prato
  // Balãozinho com quantos sapinhos há no prato. Se o prato já começa com
  // sapinhos (subtração, número que falta), mostra-os logo, durante mais tempo.
  const [contagem, setContagem] = useState(() =>
    inicial?.quantos ? { numero: inicial.quantos, vez: 1, duracao: DURACAO_INICIAL } : null,
  )

  // Arrastar com o dedo ou o rato (só começa depois de mexer 4px, para um
  // toque rápido não contar como arrasto) e também com o teclado
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  // Os sapinhos do prato esquerdo, pela ordem em que chegaram
  const noPrato = sapinhos.filter((s) => s.lugar === 'esquerda').sort((a, b) => a.chegada - b.chegada)

  function aoComecar({ active }) {
    prepararEfeitos() // carrega os sons no primeiro toque
    setAArrastar(sapinhos.find((s) => s.id === active.id))
  }

  function aoLargar({ active, over }) {
    setAArrastar(null)
    const destino = over?.id === 'esquerda' ? 'esquerda' : 'monte' // fora do prato = cai para o chão
    const sapinho = sapinhos.find((s) => s.id === active.id)
    if (!sapinho) return
    if (destino === 'esquerda' && sapinho.lugar === 'esquerda') return // largou no mesmo prato: fica igual

    if (destino === 'monte') {
      tocarEfeito('cair') // largado fora do prato: cai para o chão (volta ao seu lugar)
    } else {
      tocarEfeito('sapinho') // posto no prato
      chegadas.current += 1
    }
    const chegada = chegadas.current
    setSapinhos((todos) => todos.map((s) => (s.id === active.id ? { ...s, lugar: destino, chegada } : s)))

    // Se o prato mudou: mostra a contagem nova e avisa a página de quantos ficaram lá
    if (destino !== sapinho.lugar) {
      const quantos = noPrato.length + (destino === 'esquerda' ? 1 : -1)
      setContagem((c) => ({ numero: quantos, vez: (c?.vez ?? 0) + 1, duracao: DURACAO_CONTAGEM }))
      aoMudar?.(quantos)
    }
  }

  // Os do chão, de trás para a frente: os mais à frente ficam por cima
  const noMonte = sapinhos.filter((s) => s.lugar === 'monte').sort((a, b) => a.noMonte.y - b.noMonte.y)

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
      />

      {/* O chão: cada sapinho no seu lugar da relva */}
      {noMonte.map((s) => (
        <Sapinho
          key={s.id}
          id={s.id}
          cor={s.cor}
          tamanho={SAPINHO.noMonte}
          x={s.noMonte.x}
          y={s.noMonte.y}
          bloqueado={bloqueada}
        />
      ))}

      {/* A cópia que segue o dedo enquanto se arrasta (fica por cima de tudo) */}
      <DragOverlay dropAnimation={null}>{aArrastar && <SapinhoNoAr cor={aArrastar.cor} />}</DragOverlay>
    </DndContext>
  )
}

export default Mesa
