export type Risk = "safe" | "rebuild" | "keep"

export type StorageItem = {
  name: string
  sizeGiB: number
  risk: Risk
  what: string
  action: string
}

export const USER_HINT = "C302562"

/** Itens do print em globalStorage, em GiB. */
export const globalStorageItems: StorageItem[] = [
  {
    name: "state.vscdb",
    sizeGiB: 22.02,
    risk: "keep",
    what: "Banco SQLite com histórico de chats e agentes. Não apague o arquivo vivo — isso quebra o “Loading Chat”.",
    action:
      "Enxugue pelo Cursor: Ctrl+Shift+P → Developer: GC Agent KV Blobs e, se quiser, Developer: Delete Old Chats…",
  },
  {
    name: "anysphere.cursor-agent-worker",
    sizeGiB: 21.95,
    risk: "rebuild",
    what: "Artefatos e logs do worker de agentes em segundo plano.",
    action:
      "Com o Cursor fechado, pode esvaziar a pasta. Os agentes recriam o que precisarem.",
  },
  {
    name: "state.vscdb.backup",
    sizeGiB: 20.52,
    risk: "safe",
    what: "Cópia automática do banco. Só ocupa espaço extra.",
    action:
      "Pode apagar com o Cursor fechado. Ele gera outro backup depois.",
  },
  {
    name: "conversation-search.db",
    sizeGiB: 10.41,
    risk: "rebuild",
    what: "Índice de busca dos chats.",
    action:
      "Pode apagar com o Cursor fechado. A busca de conversas reindexa sozinha.",
  },
  {
    name: "anysphere.cursor-retrieval",
    sizeGiB: 8.61,
    risk: "rebuild",
    what: "Índice/embeddings dos projetos para o @codebase.",
    action:
      "Pode apagar. A primeira abertura de cada repo fica mais lenta enquanto reindexa.",
  },
  {
    name: "state.vscdb-shm",
    sizeGiB: 7.94,
    risk: "safe",
    what: "Memória compartilhada do SQLite. Esse tamanho só existe com o Cursor aberto e o banco enorme.",
    action: "Fecha o Cursor: o arquivo some ou encolhe sozinho.",
  },
  {
    name: "storage.json",
    sizeGiB: 7.82,
    risk: "keep",
    what: "Deveria ter alguns KB. 7,8 GiB é anormal — provavelmente estado inchado.",
    action:
      "Não apague de primeira. Depois de mover/limpar o banco, se continuar gigante, renomeie com o Cursor fechado (pode resetar preferências da UI).",
  },
  {
    name: "mcp-oauth-attempts",
    sizeGiB: 4.71,
    risk: "safe",
    what: "Logs de tentativas de OAuth de MCP. Não é histórico de chat.",
    action: "Pode apagar a pasta inteira com o Cursor fechado.",
  },
  {
    name: "mhutchie.git-graph",
    sizeGiB: 1.78,
    risk: "safe",
    what: "Cache da extensão Git Graph.",
    action: "Pode apagar. A extensão reconstrói o grafo.",
  },
  {
    name: "state.vscdb-wal",
    sizeGiB: 1.31,
    risk: "keep",
    what: "Write-ahead log do SQLite. Faz parte do banco vivo.",
    action: "Não mexa. Fecha o Cursor e o WAL costuma ser consolidado.",
  },
]

export const listedTotalGiB = globalStorageItems.reduce(
  (sum, item) => sum + item.sizeGiB,
  0
)

export const easyWinGiB = globalStorageItems
  .filter((item) => item.risk === "safe")
  .reduce((sum, item) => sum + item.sizeGiB, 0)

export const rebuildGiB = globalStorageItems
  .filter((item) => item.risk === "rebuild")
  .reduce((sum, item) => sum + item.sizeGiB, 0)
