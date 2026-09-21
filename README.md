# Verbo

App da Bíblia para ler o Novo Testamento em português, tocar o grego original e receber uma explicação na linha cristã reformada. A tela inicial é um feed vertical de versículos — Reels da Bíblia — para viciar em algo bom.

## O que tem agora

- **Reels**: deslize versículo a versículo, com uma palavra grega em destaque.
- **Ler**: NT completo. Debaixo de cada versículo, cada palavra grega é um botão.
- **Ficha da palavra**: lema, morfologia em português, glossário e Strong.
- **Explicar**: leitura reformada do versículo (com IA se houver chave; senão, um esboço local).
- **Salvos**: ficam só neste aparelho, no `localStorage`.

Sem conta, sem banco, sem Antigo Testamento (ainda).

## Como rodar

```bash
npm install
npm run dev
```

Abre em [http://127.0.0.1:43147](http://127.0.0.1:43147).

Os livros do NT vão comprimidos em `data/nt/*.json.gz` para o deploy na Vercel caber. Para conferir:

```bash
npm run check:data
```

Para regenerar o NT (grego + português):

```bash
npm run build:data
```

## IA (opcional)

Sem chave, o botão **Explicar** usa um esboço hermenêutico local.

Com modelo, crie `.env.local`:

```bash
OPENAI_API_KEY=sua_chave
```

Na Vercel, o AI Gateway / OIDC também funciona. O prompt de sistema permanece confessante: Westminster, solas, Cristo no centro, Escritura interpreta Escritura.

## Fontes do texto

O app redistribui obras livres, com a atribuição pedida pelas licenças:

- Português: [Bíblia Livre](https://github.com/blivre/BibliaLivre) (CC BY 3.0 Brasil).
- Grego: [SBL Greek New Testament](https://sblgnt.com/) (CC BY 4.0).
- Lema, morfologia, Strong e glossários: [MACULA Greek](https://github.com/Clear-Bible/macula-greek/) (CC BY 4.0), incluindo glossas da Berean e Cherith.

Não há alinhamento palavra-a-palavra entre o português e o grego. Por isso o toque abre o **grego daquele versículo**, não um mapeamento 1:1 com cada vocábulo da tradução.
