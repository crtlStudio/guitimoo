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
  - 🟧 Detetive das Profissões (`detetive`, laranja), **inativo**: ainda não existe.
- Cada 10 estrelas de um jogo = 1 peça da cor desse jogo, para a mascote ativa. Cada projeto precisa de 5 peças de cada cor dos jogos **ativos** (agora 4 cores = 20 peças).
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
4. ⬜ **Ecrã da construção de cada mascote, a crescer peça a peça** ← próximo
5. ⬜ Botão de limpar o progresso nas Definições, com proteção para adultos (`limparProgresso` já existe em `progresso.js`; mantém o nível e a mascote)
6. ⬜ Jogo novo: Detetive das Profissões (pasta e página "Em breve" já existem; para ligar: `ativo: true` no config)

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
