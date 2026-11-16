# Retomar o trabalho no GuitimOO

> Prompt para colar no Claude Code (VS Code) noutro computador.
> Antes: `git fetch` e `git switch novo-conceito-mascotes`, depois `npm install`.

---

Estou a continuar o GuitimOO (app de jogos educativos para crianças, React + Vite + Capacitor). Estou a aprender JavaScript: explica o que cada parte faz em linguagem simples. Antes de mudanças grandes, mostra-me primeiro o plano (ou um exemplo dos dados) e espera pela minha confirmação. Faz só o passo que eu pedir; não avances sozinho. Ignora as regras do graphify no CLAUDE.md (não está instalado).

## O conceito novo (tipo Tamagotchi, só com reforço positivo)

- 4 mascotes são companheiros. A criança escolhe uma e ajuda-a a acabar um projeto:
  - Sapo construtor → a casa (legos)
  - Panda jardineiro → o bosque de bambu (sementes)
  - Coruja sábia → a biblioteca (livros)
  - Tartaruga viajante → a carrinha das viagens (peças)
- Os jogos não têm mascote. A mascote escolhida "percorre" os jogos: aparece no balão de fala, no fim do jogo e no caminho do jogo das Horas.
- Jogos (id, cor):
  - 🟥 Matemática e Lógica (`matematica`, vermelho)
  - 🟦 Português (`portugues`, azul)
  - 🟩 Memória (`memoria`, verde)
  - 🟨 Horas e Rotinas (`horas`, amarelo)
  - 🟧 Detetive das Profissões (`detetive`, laranja), ativo desde 2026-11-16.
- Cada 75 estrelas de um jogo = 1 peça da cor desse jogo (era 10; mudado a 2026-11-16 a pedido do utilizador; `ESTRELAS_POR_PECA` no config), para a mascote ativa. Cada projeto precisa de 5 peças de cada cor dos jogos **ativos** (agora 4 cores = 20 peças).
- Cor já completa: as estrelas contam, e a criança pode guardar as peças a mais na **reserva** da mascote. Essas peças entram sozinhas no projeto seguinte.
- Projeto completo: fica com data (`completoEm`) e começa logo o projeto seguinte da mesma mascote (2.ª casa, etc.). Um projeto acabado continua acabado, mesmo que o Detetive passe a ativo.
- Tem de haver sempre uma mascote ativa quando se joga. Nunca se perde nada, e não há castigos.
- 3 níveis (`facil`, `medio`, `dificil`), que substituem as faixas etárias 3–4, 5–6 e 7–8. Escolhe-se uma vez e vale para todos os jogos.
- Percurso: Início → `/nivel` → `/mascotes` → `/jogos` → `/<id do jogo>`.
- Sem base de dados: tudo fica no telemóvel com `@capacitor/preferences`, numa chave `progresso` com versão e `perfis` (por agora só `principal`, preparado para perfis no futuro).

## Passos

1. ✅ Guardar o progresso (dados + lógica + testes)
2. ✅ Ecrãs de escolher nível, mascote e jogo; nomes novos dos jogos
3. ✅ Converter estrelas em peças, com festa e com a pergunta da reserva
4. 🟨 **Ecrã da construção de cada mascote, a crescer peça a peça** (`/construcao`)
   - ✅ Dados: `vistas` em cada mascote, `pecasNovas`, `marcarComoVistas`, `corQueMaisFalta`
   - ✅ Ecrã com emojis provisórios: projeto "fantasma" que ganha cor de baixo para cima, torres de 5 lugares por cor, peças novas a cair, mão 👆 a apontar o jogo que mais falta
   - ✅ Entradas: `BotaoConstrucao.jsx` (🏠 com anel de progresso; pulsa com seta se há peças novas) nos `/jogos` e no fim do jogo
   - ✅ Caricaturas das mascotes: `src/assets/mascotes/<id>.webp` (dos PNG de `icones_construção/`), com `components/ImagemMascote.jsx` (serve para outros ecrãs). Na construção: grande à esquerda e pequena no título. Ajustado para 5 torres (Detetive ligado)
   - ⬜ **O utilizador não gostou do aspeto**: está a criar os ícones de cada jogo (`src/assets/icones_jogo/`) e caricaturas de cada mascote. Quando chegarem, refazer o visual (também a imagem de cada projeto acabado, que "ganha cor")
5. ✅ Botão "Apagar o progresso" nas Definições (`ApagarProgresso.jsx`): proteção para adultos (escrever um número dado por extenso) + confirmação com o que se perde. Apaga o progresso e o total de estrelas (`apagarProgresso` em `estado.js`); mantém o nível, a mascote, a memória das perguntas dos jogos e os volumes
6. ✅ Jogo novo: Detetive das Profissões, com os 3 níveis (ligado com `ativo: true`: os projetos a meio passaram a precisar de 5 peças laranja)
   - ✅ Parte 1: `games/detetive/profissoes.js` (14 profissões: 3 pistas + local cada, tudo único), `regras.js`, `memoria.js` (+ testes)
   - ✅ Parte 2: nível fácil (`pages/detetive/Jogo34.jsx`: pista na `Lupa` → tocar numa de 3 pessoas) + `Instrucoes.jsx` com demonstração animada
   - ✅ Parte 3: nível médio (`Jogo56.jsx`: 3 lupas, as 2 últimas com "?" destapam-se com um toque → 4 pessoas). Partes comuns aos 2 níveis: `usePergunta.js` e `EscolherPessoa.jsx`
   - ✅ Parte 4: nível difícil (`Jogo78.jsx`: arrastar — ou tocar na pessoa e depois no local — 3 profissões para os locais; 2 rondas = 6 pares)
   - ✅ Parte 5 (antecipada, para o utilizador testar): `ativo: true`; música `musica-detetive.m4a`
   - ✅ Imagens das 14 pessoas (`src/assets/detetive/profissoes/<id>.webp`) e de 12 locais (`src/assets/detetive/locais/<id do local>.webp`), 512×512, convertidas dos PNG de `detetive_icones_jogo/`. Mostradas com `pages/detetive/Retrato.jsx` (`Retrato` e `ImagemLocal`): uma imagem nova entra sozinha; sem imagem, aparece o emoji. Os nomes seguem o género das imagens
   - Decidido: as pistas ficam em emoji. Pendente do utilizador: imagens do espaço (`espaco`) e do pavilhão (`pavilhao`)

## Onde está cada coisa

- `src/games/progresso/config.js`: TUDO o que se afina (`ESTRELAS_POR_PECA`, `PECAS_POR_COR`, `JOGOS`, `MASCOTES`, `NIVEIS`).
- `src/games/progresso/progresso.js`: funções puras com testes: `criarProgresso`, `escolherNivel`, `escolherMascote`, `adicionarEstrelas`, `guardarNaReserva`, `pecasEmFalta`, `projetoAtual`, `projetoEstaCompleto`, `projetosAcabados`, `limparProgresso`, `repararProgresso`, `nivelDoEscalao`/`escalaoDoNivel`, `somarPremios`.
- `src/games/progresso/guardar.js`: lê e grava no Preferences. Os dados estragados não rebentam a app (ficam guardados em `progresso:estragado`). Converte o escalão antigo para o nível novo.
- `src/games/progresso/estado.js`: o progresso "vivo", partilhado por todos os ecrãs. Funções: `mudarProgresso`, `ganharEstrelas`, `guardarPecasNaReserva`.
- `src/games/progresso/textos.js`: frases com género e número certos ("2 sementes vermelhas", "todos os legos").
- `src/components/useProgresso.js`: hooks `usePerfil`, `useMascoteAtiva`, `useChamada`, `useEscalao`.
- `src/components/Guarda.jsx`: manda a criança para trás se faltar escolher o nível ou a mascote.
- `src/components/useJogo.js`: o motor de cada jogo; `useJogo(perguntas, jogoId)` devolve também `premio`.
- `src/components/FimDeJogo.jsx`, `PremioPecas.jsx`, `ProjetoAcabado.jsx`, `Peca.jsx`: fim de jogo, peças, reserva, festa do projeto.
- `src/pages/{niveis,mascotes,jogos}`: ecrãs de escolha (com `EcraEscolha.jsx`).
- `src/pages/{matematica,portugues,memoria,horas,detetive}` + `src/games/<id>`: cada jogo.
- Os jogos continuam a usar `'3-4'`, `'5-6'` e `'7-8'` por dentro; a página converte o nível com `useEscalao()`.
- As chaves antigas no telemóvel (`sapo:progresso:…`, `panda:saco:…`, `coruja:…`, `tartaruga:…`) mantêm o nome **de propósito**, para não se perder progresso.

## Provisório / pendente

- **Tudo muito visual:** as crianças pequenas não leem. Explicações curtas, com setas, círculos e coisas interativas, em vez de frases.
- Ícones dos jogos: `src/assets/icones_jogo/<id>.webp` (512×512, transparentes), mostrados com `IconeJogo.jsx` nos jogos e na construção. Os PNG originais ficaram na pasta.
- O fundo das mascotes é agora `fundo_mascotes.webp` (os nomes ficam por cima das cabeças). `mascotes.webp`/`.png` já não são usadas.

- **As peças e os projetos não têm imagens:** cada peça é um quadrado na cor do jogo com um emoji (`emojiPeca` no config: 🧱 🌱 📕 🔩) e cada projeto é um emoji (`iconeProjeto`: 🏠 🎋 📚 🚐). Quando houver imagens, trocam-se em `Peca.jsx` e no config. O passo 4 vai precisar das imagens de cada projeto a crescer.
- `src/assets/sons/cubinho.mp3` é o som antigo do "sapinho". Ainda não verifiquei se é um coaxar; se for, deve ser trocado.
- Jogo das Horas: o lado esquerdo ficou livre (era onde estava a tartaruga). As posições podem ser afinadas com o fundo novo.
- Ideia pendente: quando a cor de um jogo está completa, sugerir à criança outro jogo.
- `panda.webp`, `coruja.webp` e `tartaruga.webp` já não são usadas pelos jogos; podem servir para o passo 4.
- A balança e os cubos da Matemática são WebP gerados a partir dos PNG originais (que ficaram na pasta).

## Como verificar

- `npm test` (vitest, 251 testes), `npx eslint src`, `npx vite build`.
- Para ver a app: `npx vite`. Para testes no browser usei `playwright-core` instalado fora do projeto, com o Chrome do sistema. O progresso fica no `localStorage` com a chave `CapacitorStorage.progresso`, e pode ser preenchido à mão para testar casos (cor completa, projeto quase completo).

## Para começar

Lê este ficheiro e os principais de `src/games/progresso/`. Depois propõe-me o passo 4: como vai ser o ecrã da construção (onde se chega a ele, o que mostra, que imagens são precisas) e espera pela minha confirmação.
