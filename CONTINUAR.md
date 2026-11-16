# Retomar o trabalho no GuitimOO

> Prompt para colar no Claude Code (VS Code) noutro computador.
> Antes: `git pull` (está tudo no ramo `main`) e depois `npm install`.

---

Estou a continuar o GuitimOO (app de jogos educativos para crianças, React + Vite + Capacitor). Estou a aprender JavaScript: explica o que cada parte faz em linguagem simples. Antes de mudanças grandes, mostra-me primeiro o plano (ou um exemplo dos dados) e espera pela minha confirmação. Faz só o passo que eu pedir; não avances sozinho. Ignora as regras do graphify no CLAUDE.md (não está instalado). Só faz commit ou push quando eu pedir.

**Tudo tem de ser muito visual.** As crianças mais pequenas não sabem ler. As explicações têm de ser curtas, com setas e círculos, e interativas.

## O conceito (tipo Tamagotchi, só com reforço positivo)

- 4 mascotes companheiras. A criança escolhe uma e ajuda-a a acabar um projeto:
  - Sapo → casa
  - Panda → bosque de bambu
  - Coruja → biblioteca
  - Tartaruga → carrinha
- 5 jogos, todos ativos:
  - 🟥 Matemática e Lógica (`matematica`)
  - 🟦 Português (`portugues`)
  - 🟩 Memória (`memoria`)
  - 🟨 Horas e Rotinas (`horas`)
  - 🟧 Detetive das Profissões (`detetive`)
- 75 estrelas de um jogo = 1 peça da cor desse jogo, para a mascote ativa. Cada projeto precisa de 5 peças de cada cor.
- Há reserva para as peças a mais. Nunca se perde nada, e não há castigos.
- 3 níveis (`facil`, `medio`, `dificil`). Por dentro, os jogos usam `'3-4'`, `'5-6'` e `'7-8'`.
- Percurso: Início → `/nivel` → `/mascotes` → `/jogos` → `/<id do jogo>`. Há também o ecrã de construção de cada mascote.
- Tudo fica no telemóvel com `@capacitor/preferences`, na chave `progresso`. No browser fica em `localStorage` com a chave `CapacitorStorage.progresso`.

## O que está feito

- Progresso, escolha de nível, mascote e jogo, peças e reserva.
- Ecrã de construção das mascotes.
- Botão de apagar o progresso, com proteção para adultos.
- Jogo do Detetive.
- **Matemática com 3 jogos dentro, que se intercalam ao acaso** (não se escolhem; nunca saem mais de 2 iguais seguidos):
  1. **Balança (contas).** O corpo da balança ficou mais pequeno e os braços do mesmo tamanho. O braço mais pesado desce e o mais leve sobe; mexe mais no fácil.
     - No médio e no difícil, na **soma**, os cubos têm de ter as cores dos números do cartão: em 2 (azul) + 3 (verde), põem-se 2 azuis e 3 verdes. Se a quantidade está certa mas as cores não, aparece "Quase! Usa as cores dos números".
  2. **Lógica.** Uma fila de cubos com um padrão e um **?**, e a criança escolhe o que falta. Não há balança.
  3. **Quantidades.** Um quadro com cubos de um lado e números do outro, nos dois sentidos.
- **Dedo fantasma** (`src/components/DedoFantasma.jsx` + `linhaDoTempo.js`). Aparece ao fim de 3 s sem a criança tocar no ecrã e mostra **como se faz, nunca a resposta certa**. Pode fazer sequências de gestos (tocar N vezes, arrastar, percorrer).
  - Na soma: toca 2× no número azul e leva um cubo azul para o prato; depois faz o mesmo com o verde.
  - A escolher o número: carrega 2× num número **errado**.
  - Os sítios para onde o dedo aponta estão em `src/pages/matematica/ajuda.js`.
- Os sons e músicas originais foram recuperados e **ficam**: a pasta `sons-originais/` e os `.mp3` em `src/assets/`. A app toca as versões `.m4a`, que são as mesmas músicas.

## Próximos passos (a combinar comigo)

1. Testar bem a Matemática no tablet e afinar o que eu disser.
2. Talvez: demonstração nas instruções para cada um dos 3 jogos da Matemática. Agora as instruções só explicam a balança.
3. Levar o conceito dos **3 jogos dentro de cada jogo** e o **dedo fantasma** aos outros jogos: Português, Memória, Horas e Detetive. Para cada jogo, primeiro o plano e espero pela confirmação.

## Pendente da minha parte (imagens)

- Locais do Detetive: `espaco.webp` e `pavilhao.webp`.
- Imagens dos projetos das mascotes a crescer.

## Onde está cada coisa

- `src/games/progresso/config.js`: tudo o que se afina (estrelas por peça, jogos, mascotes, níveis).
- `src/games/progresso/*`: progresso, peças e reserva, como funções puras com testes.
- `src/games/<jogo>/*`: as regras de cada jogo, sem ecrã e com testes.
- `src/pages/<jogo>/*`: os ecrãs.
- Matemática:
  - `games/matematica/`:
    - `contas.js`: contas e a regra das cores.
    - `balanca.js`: quanto desce cada braço.
    - `logica.js`, `quantidades.js`.
    - `rodizio.js`: sorteia o jogo seguinte.
  - `pages/matematica/`:
    - `Matematica.jsx`: alterna os 3 jogos.
    - `Jogo34.jsx`: fácil.
    - `JogoContas.jsx`: médio e difícil.
    - `JogoLogica.jsx`, `JogoQuantidades.jsx`.
    - `Mesa.jsx`, `Balanca.jsx`, `Cubinho.jsx`, `medidas.js`.
- As chaves antigas no telemóvel (`sapo:progresso:…` e outras) mantêm o nome **de propósito**, para não se perder progresso.

## Como verificar

- `npm test` (vitest, 315 testes; **não** usar `npx vitest`), `npx eslint src`, `npx vite build`.
- Para ver a app: `npx vite`. Para testes no browser usei `playwright-core` instalado fora do projeto, com o Chrome do sistema. O progresso pode ser preenchido à mão no `localStorage` (`CapacitorStorage.progresso`) para testar casos.

## Para começar

Lê este ficheiro e pergunta-me o que vamos fazer hoje.
