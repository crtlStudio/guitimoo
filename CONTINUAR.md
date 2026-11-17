# Retomar o trabalho no GuitimOO

> Prompt para colar no Claude Code (VS Code) noutro computador.
> Antes: `git pull` (está tudo no ramo `main`) e depois `npm install`.

---

Estou a continuar o GuitimOO (app de jogos educativos para crianças, React + Vite + Capacitor). Estou a aprender JavaScript: explica o que cada parte faz em linguagem simples. Antes de mudanças grandes, mostra-me primeiro o plano (ou um exemplo dos dados) e espera pela minha confirmação. Faz só o passo que eu pedir; não avances sozinho. Ignora as regras do graphify no CLAUDE.md (não está instalado). Só faz commit ou push quando eu pedir.

**Tudo tem de ser muito visual.** As crianças mais pequenas não sabem ler. As explicações têm de ser curtas, com o dedo fantasma a mostrar como se faz, e interativas.

## O conceito (tipo Tamagotchi, só com reforço positivo)

- 4 mascotes companheiras. A criança escolhe uma e ajuda-a a acabar um projeto:
  - Sapo → casa
  - Panda → bosque de bambu
  - Coruja → biblioteca (estante)
  - Tartaruga → carrinha (autocaravana)
- 5 jogos, todos ativos:
  - 🟥 Matemática e Lógica (`matematica`)
  - 🟦 Português (`portugues`)
  - 🟩 Memória (`memoria`)
  - 🟨 Horas e Rotinas (`horas`)
  - 🟧 Detetive das Profissões (`detetive`)
- 75 estrelas de um jogo = 1 peça da cor desse jogo, para a mascote ativa. Cada projeto precisa de 5 peças de cada cor.
- Há reserva para as peças a mais. Nunca se perde nada, e não há castigos.
- 3 níveis (`facil`, `medio`, `dificil`). Por dentro, os jogos usam `'3-4'`, `'5-6'` e `'7-8'`.
- **Percurso:** Início → `/mascotes` → `/nivel` (mascote à esquerda, 3 níveis na vertical) → `/objetivo` (só na 1.ª vez de cada mascote) → `/jogos` → `/<id do jogo>`.
  - Nos jogos, o botão voltar leva às mascotes. Em `/jogos` há uma fila de níveis pequenos em cima para mudar a dificuldade.
  - `/construcao` mostra o projeto da mascote a encher de cor. O botão `?` (canto superior esquerdo) volta a mostrar o objetivo; o ▶ (canto superior direito) vai jogar.
- Tudo fica no telemóvel com `@capacitor/preferences`, na chave `progresso`. No browser fica em `localStorage` com a chave `CapacitorStorage.progresso`. Cada mascote guarda `objetivoVisto`.

## O que está feito

- Progresso, escolha de mascote e nível, peças e reserva, ecrã de construção, apagar o progresso (com proteção para adultos).
- **Página do objetivo** (`pages/objetivo/`): "Ajuda o Sapo Construtor", com o dedo fantasma a mostrar que jogar enche o projeto de cor.
- **Imagens dos projetos** (`assets/icones_objetivo/`, componente `ImagemProjeto.jsx`).
- **Matemática com 3 jogos que se intercalam ao acaso** (nunca mais de 2 iguais seguidos): balança (contas), lógica (padrões) e quantidades. As instruções mostram os 3 jogos, um de cada vez, com o dedo fantasma (`pages/matematica/passosDasInstrucoes.js`).
- **Português com 5 rondas sorteadas** entre o jogo do nível e a **caixa das palavras**:
  - Jogo do nível: balão da letra (fácil), sopa de letras com 1 palavra (médio), sopa com 3 palavras (difícil; as 3 contam como 1 vitória — decidido assim).
  - Caixa das palavras (`games/portugues/caixa.js`, `pages/portugues/JogoCaixa.jsx`): sai um cartão do monte para a ranhura e a criança arrasta (ou toca) os cubos de madeira com as letras para os lugares. Ajudas a diminuir: fácil com palavras até 4 letras, palavra escrita e letras-guia; médio com a palavra escrita; difícil só com a imagem e 2 cubos a mais.
- **Dedo fantasma** (`components/DedoFantasma.jsx`): aparece ao fim de 3 s sem toques e mostra **como se faz, nunca a resposta certa**.
- **Ícones/ilustrações das palavras** (`assets/icones_gerais/`, componente `components/ImagemPalavra.jsx`):
  - Carrega sozinho todos os `.png` da pasta. O nome do ficheiro é a palavra sem acentos e em minúsculas (`leao.png`). Imagem nova com o nome certo entra sem mexer no código.
  - Se faltar a imagem, mostra o emoji.
  - Ficheiros com nome diferente da palavra estão em `OUTROS_NOMES` (a imagem responde pelos dois nomes): carrinha → camião, galinha → galo (a imagem é um galo), raio → trovão, girasol → girassol, semear → rebento, globo → planeta, trofeu → taça, busola → bússola, semafro → semáforo, etc.
  - Já usado em: Português (jogos e instruções), Memória dos sons, Horas, pistas do Detetive e peças das mascotes (`imagemPeca` no `config.js`).
  - As imagens devem ser pequenas (~180 px). As grandes reduzem-se e os originais ficam em `assets/icones_gerais_originais/` (não entram na app).
- Detetive: todas as profissões e locais já têm imagem (`assets/detetive/`, em `.webp` 512×512; os `.png` ao lado são os originais).
- **Instruções com painéis e dedo** (`components/demonstracao/`): o cartão com os painéis, o dedo, o ✓ e o motor dos passos, partilhados. Usado na Matemática (3 painéis) e no Português (jogo do nível + caixa das palavras); as coreografias estão em `pages/<jogo>/passosDasInstrucoes.js`.
- **Horas e Detetive com imagens:** cada item das Horas tem `imagem` no JSON (`rotinas.json`, `atividades.json`); as pistas do Detetive têm o nome da imagem em `IMAGEM_DA_PISTA` (`games/detetive/profissoes.js`) e desenham-se com `pages/detetive/Pista.jsx`.
  - Rotina do pintainho: Ovo → Pintainho → Galo. Pista da cientista: óculos de proteção 🥽 (era a placa de Petri).
- **Cabeças das mascotes** (`assets/mascotes/cabecas/<id>.png`, componente `components/CabecaMascote.jsx`): aparecem no balão da mascote, no fim do jogo e no caminho das Horas. Sem imagem, mostra o emoji. Originais grandes em `assets/mascotes/cabecas_originais/` (não entram na app).

## Ícones que faltam (estou a fazê-los)

Só falta **`oculos_protecao.png`** (pista da cientista), para `src/assets/icones_gerais/` (~180 px). Já está ligado: até haver imagem aparece o emoji 🥽.

## Android (atenção)

- O Gradle tem de ficar na **8.14.3** (`android/gradle/wrapper/gradle-wrapper.properties`). O plugin Android é o 8.13.0 e **não funciona com Gradle 9.6 ou mais recente**. Se o Android Studio sugerir atualizar o Gradle ou o plugin, **recusar**.
- Para levar a app para o Android Studio: `npx vite build`, `npx cap sync android` e `npx cap open android` (ou File → Open → pasta `android`). Para compilar na linha de comandos é preciso `JAVA_HOME` com o Java do Android Studio (`C:\Program Files\Android\Android Studio\jbr`).

## Próximos passos (a combinar comigo)

1. O ícone que falta (oculos_protecao).
2. Levar o conceito dos **vários jogos dentro de cada jogo** e o **dedo fantasma** à Memória, Horas e Detetive. Para cada jogo, primeiro o plano e espero pela confirmação.
3. Imagens dos projetos das mascotes a crescer (minhas).

## Onde está cada coisa

- `src/games/progresso/config.js`: tudo o que se afina (estrelas por peça, jogos, mascotes, peças, níveis).
- `src/games/progresso/*`: progresso, peças, reserva e objetivo visto, como funções puras com testes.
- `src/games/<jogo>/*`: as regras de cada jogo, sem ecrã e com testes.
- `src/pages/<jogo>/*`: os ecrãs.
- `src/data/palavras.json`: as palavras do Português por escalão (`palavra`, `mostrar` com acentos, `emoji`).
- `src/games/matematica/rodizio.js`: `sortearTipo` (usado na Matemática e no Português para intercalar jogos).
- As chaves antigas no telemóvel (`sapo:progresso:…`, `panda:saco:…`) mantêm o nome **de propósito**, para não se perder progresso.

## Como verificar

- `npm test` (vitest, 350 testes; **não** usar `npx vitest`), `npx eslint src`, `npx vite build`.
- Para ver a app: `npx vite`. Para testes no browser usei `playwright-core` instalado fora do projeto, com o Chrome do sistema. Clicar no "Vamos jogar!" precisa de `click({ force: true })` (o botão está sempre a pulsar). O progresso pode ser preenchido à mão no `localStorage` (`CapacitorStorage.progresso`) para testar casos.

## Para começar

Lê este ficheiro e pergunta-me o que vamos fazer hoje.
