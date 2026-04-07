<div align="center">

<img src="public/icon.svg" alt="EduPlan AI" width="80" height="80" />

# EduPlan AI

### Plataforma de IA para Professores do Ensino Público

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

<br/>

> Projeto desenvolvido para o **Hackathon 6FSDT — Inovação no Auxílio aos Professores e Professoras do Ensino Público** · PósTech FIAP

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Provedores de IA](#-provedores-de-ia)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rotas da API](#-rotas-da-api)
- [Telas da Aplicação](#-telas-da-aplicação)

---

## 🎓 Sobre o Projeto

O **EduPlan AI** nasceu de uma necessidade real: professores do ensino público brasileiro enfrentam jornadas extensas, turmas superlotadas e pouco tempo para preparar materiais didáticos de qualidade.

A plataforma usa **Inteligência Artificial** para automatizar a criação de:

- Planos de aula estruturados e completos
- Tarefas e atividades personalizadas por dificuldade
- Questionários e avaliações com gabarito automático
- **Correção automática** de avaliações com feedback detalhado por critério

Tudo isso em segundos, com linguagem adaptada à série e contexto do professor — para que ele possa **focar no que importa: ensinar**.

---

## ✨ Funcionalidades

### 📝 Geração de Conteúdo com IA

| Ferramenta | Descrição |
|---|---|
| **Plano de Aula** | Gera um plano completo com objetivos, metodologia, recursos e avaliação |
| **Tarefas** | Cria atividades para casa com tipo (exercício, redação, pesquisa…) e nível de dificuldade |
| **Questionários** | Produz avaliações com múltipla escolha, V/F, dissertativa ou mista — com gabarito |
| **Corrigir Avaliação** | Corrige respostas de alunos com nota, feedback por critério e orientações de melhoria |

### 📷 Correção por Imagem (Multimodal)

Na tela de correção, o professor pode **enviar uma foto ou PDF** da folha de resposta do aluno. A IA analisa a imagem e realiza a correção sem precisar digitar o texto manualmente.

### 🔗 Vinculação de Conteúdo

Tarefas e questionários podem ser **vinculados a um plano de aula existente**, fornecendo contexto para a IA gerar conteúdo mais coerente com o que foi ensinado em aula. Na correção, o gabarito de uma atividade já gerada pode ser vinculado para pré-preencher automaticamente os campos do formulário.

### 🤖 Multi-Provedor de IA

Suporte a **5 provedores** e **30+ modelos** de linguagem. O professor escolhe o modelo na hora de gerar — sem restrições.

### 📚 Histórico Completo

Todos os conteúdos gerados ficam salvos localmente e podem ser revisitados, filtrados por tipo e excluídos individualmente.

### 🖨️ Exportação

- **Copiar** o conteúdo gerado com um clique
- **Imprimir / Salvar como PDF** diretamente pelo navegador

### 🌙 Tema Escuro / Claro

Interface com suporte a dark mode e light mode, com alternância rápida na barra lateral.

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2 | Framework React com App Router + API Routes |
| [React](https://react.dev/) | 19 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilização utilitária |
| [shadcn/ui](https://ui.shadcn.com/) | latest | Componentes de UI acessíveis |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | Gerenciamento de tema dark/light |
| [Lucide React](https://lucide.dev/) | latest | Ícones |
| [@google/generative-ai](https://ai.google.dev/) | 0.24 | SDK do Google Gemini |
| [@anthropic-ai/sdk](https://docs.anthropic.com/) | 0.82 | SDK do Claude (Anthropic) |
| [openai](https://platform.openai.com/) | 6.33 | SDK OpenAI / Groq / GitHub Models |

---

## 🤖 Provedores de IA

Todos os provedores são configurados pelo próprio professor em **Configurações**. As chaves são salvas com segurança no servidor (`.env.local`) e **nunca expostas ao navegador**.

| Provedor | Modelos Disponíveis | Tier Gratuito |
|---|---|---|
| **Groq** | Llama 3.3 70B, Llama 3.1, Mixtral 8x7B, Gemma 2, DeepSeek R1, Qwen QwQ 32B | ✅ 14.400 req/dia |
| **Google Gemini** | Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash, 1.5 Pro, 1.5 Flash | ✅ Disponível |
| **GitHub Models** | GPT-4o, o1, o3-mini, Llama 3.3, Mistral Large, Phi-4 | ✅ Com conta GitHub |
| **Anthropic** | Claude Haiku 4.5, Sonnet 4.6, Opus 4.6, Claude 3.5 Haiku | ❌ Pago |
| **OpenAI** | GPT-4o, GPT-4o mini, o1-mini, o3-mini | ❌ Pago |

> 💡 **Para começar sem custo:** use **Groq** (ultra-rápido e gratuito) ou **Google Gemini** (ótima qualidade no tier gratuito).

---

## 📁 Estrutura do Projeto

```
pos-tech-hackaton/
├── app/
│   ├── api/
│   │   ├── config/              # Gerenciamento de chaves de API (GET/POST/DELETE)
│   │   │   └── test/            # Validação de chave de API contra o provedor
│   │   ├── corrigir/            # Correção de avaliações com IA (suporte a imagem)
│   │   ├── gerar-plano/         # Geração de plano de aula
│   │   ├── gerar-tarefas/       # Geração de tarefas
│   │   └── gerar-questionarios/ # Geração de questionários
│   ├── components/
│   │   ├── AppShell.tsx         # Layout principal (sidebar + conteúdo)
│   │   ├── Sidebar.tsx          # Navegação lateral com tema toggle
│   │   ├── ModelSelector.tsx    # Seletor de provedor e modelo de IA
│   │   ├── PlanoSelector.tsx    # Vinculador de plano de aula existente
│   │   ├── ConteudoSelector.tsx # Vinculador de conteúdo histórico (gabarito)
│   │   └── ThemeProvider.tsx    # Provedor de tema escuro/claro
│   ├── lib/
│   │   ├── ai-generate.ts       # Função central de geração (multi-provedor, timeout, max_tokens)
│   │   ├── providers.ts         # Configuração dos provedores e modelos
│   │   ├── env-keys.ts          # Leitura/escrita de chaves no .env.local
│   │   ├── historico.ts         # Gerenciamento do histórico (localStorage, limite de tamanho)
│   │   ├── markdown.ts          # Renderizador Markdown seguro contra XSS
│   │   ├── sanitize.ts          # Sanitização de inputs antes de compor prompts
│   │   └── api-error.ts         # Tratamento centralizado de erros de API
│   ├── corrigir/                # Página: Corrigir Avaliação
│   ├── criar/                   # Página: Gerar Plano de Aula
│   ├── tarefas/                 # Página: Gerar Tarefas
│   ├── questionarios/           # Página: Gerar Questionários
│   ├── historico/               # Página: Histórico de conteúdos
│   ├── resultado/               # Página: Visualizar resultado salvo
│   ├── configuracoes/           # Página: Configurar chaves de API
│   ├── layout.tsx               # Layout raiz da aplicação
│   └── page.tsx                 # Dashboard principal
├── components/
│   └── ui/                      # Componentes shadcn/ui (Button, Card, Input…)
├── public/
│   └── icon.svg                 # Ícone da aplicação
├── .env.local                   # Chaves de API (não versionado)
├── .gitignore
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm, yarn ou pnpm

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pos-tech-hackaton.git
cd pos-tech-hackaton

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)** no seu navegador.

> Na primeira execução, acesse **Configurações** e adicione pelo menos uma chave de API para começar a gerar conteúdo.

### Build de Produção

```bash
npm run build
npm start
```

---

## 🔑 Variáveis de Ambiente

As chaves podem ser configuradas pela interface em **Configurações** ou manualmente no `.env.local`:

```env
# Google Gemini — aistudio.google.com
GEMINI_API_KEY=AIza...

# Groq — console.groq.com
GROQ_API_KEY=gsk_...

# Anthropic — console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# GitHub Models — github.com/marketplace/models
GITHUB_TOKEN=github_pat_...

# OpenAI — platform.openai.com
OPENAI_API_KEY=sk-...
```

> ⚠️ O arquivo `.env.local` está no `.gitignore` e **nunca será versionado**.

---

## 🔌 Rotas da API

### `POST /api/gerar-plano`

Gera um plano de aula completo.

```json
// Body
{
  "materia": "Matemática",
  "serie": "6º ano EF",
  "tema": "Frações",
  "duracao": "50",
  "objetivos": "Opcional",
  "aiConfig": { "provider": "groq", "model": "llama-3.3-70b-versatile" }
}
// Response
{ "plano": "## Plano de Aula\n..." }
```

### `POST /api/gerar-tarefas`

Gera uma atividade para casa.

```json
// Body
{
  "materia": "Matemática",
  "serie": "6º ano EF",
  "tema": "Frações",
  "tipoTarefa": "Exercícios",
  "dificuldade": "Médio",
  "observacoes": "Opcional",
  "planoContexto": "Opcional — conteúdo do plano vinculado",
  "aiConfig": { "provider": "gemini", "model": "gemini-2.5-flash" }
}
// Response
{ "conteudo": "## Tarefa\n..." }
```

### `POST /api/gerar-questionarios`

Gera um questionário com gabarito.

```json
// Body
{
  "materia": "História",
  "serie": "9º ano EF",
  "tema": "Segunda Guerra Mundial",
  "tipo": "Múltipla Escolha",
  "quantidade": "10",
  "dificuldade": "Difícil",
  "contexto": "Opcional",
  "planoContexto": "Opcional — conteúdo do plano vinculado",
  "aiConfig": { "provider": "anthropic", "model": "claude-sonnet-4-6" }
}
// Response
{ "conteudo": "## Questionário\n..." }
```

### `GET /api/config`

Retorna os provedores configurados.

```json
// Response
{ "configured": { "gemini": true, "groq": false, "anthropic": true } }
```

### `POST /api/config` · `DELETE /api/config`

Salva ou remove uma chave de API.

```json
// Body (POST)
{ "provider": "gemini", "apiKey": "AIza..." }

// Body (DELETE)
{ "provider": "gemini" }
```

### `POST /api/config/test`

Valida uma chave de API realizando uma chamada mínima ao provedor antes de salvar.

```json
// Body
{ "provider": "groq", "apiKey": "gsk_..." }

// Response (sucesso)
{ "ok": true }

// Response (falha)
{ "error": "Chave de API inválida ou sem permissão." }
```

### `POST /api/corrigir`

Corrige uma avaliação de aluno. Aceita texto digitado **ou** imagem/PDF (base64).

```json
// Body
{
  "tipoAvaliacao": "questionario",
  "materia": "Matemática",
  "serie": "6º ano EF",
  "nomeAluno": "Opcional",
  "enunciado": "Opcional — gabarito ou proposta da questão",
  "resposta": "Resposta digitada pelo professor (ou vazio se imageBase64 for enviado)",
  "imageBase64": "Opcional — imagem da folha de resposta em base64",
  "imageMimeType": "image/jpeg",
  "criteriosPersonalizados": "Opcional — critérios adicionais do professor",
  "aiConfig": { "provider": "gemini", "model": "gemini-2.5-flash" }
}

// Response
{
  "correcao": "## Resultado da Correção\n### Nota Final\n..."
}
```

---

## 🖥️ Telas da Aplicação

| Tela | Rota | Descrição |
|---|---|---|
| **Dashboard** | `/` | Visão geral com estatísticas e acesso rápido às ferramentas |
| **Gerar Plano de Aula** | `/criar` | Formulário + resultado lado a lado com copiar e imprimir |
| **Gerar Tarefas** | `/tarefas` | Formulário com vínculo a plano + resultado ao lado |
| **Gerar Questionários** | `/questionarios` | Tipo, quantidade e dificuldade personalizáveis + resultado ao lado |
| **Corrigir Avaliação** | `/corrigir` | Formulário com vínculo a gabarito, upload de imagem e correção detalhada por IA |
| **Histórico** | `/historico` | Todos os conteúdos gerados com filtros e exclusão individual |
| **Resultado** | `/resultado` | Visualização detalhada de um conteúdo salvo com exportação PDF |
| **Configurações** | `/configuracoes` | Gerenciamento seguro das chaves de API por provedor com validação em tempo real |

---