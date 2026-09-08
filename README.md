# Cursor comendo o C: — enxugar ou mover para o D:

Guia e scripts PowerShell para o caso em que `%APPDATA%\Cursor\User\globalStorage` passa de **100 GiB** (histórico de chat, backup do SQLite, índice e logs). Não é o instalador do Cursor: é estado local que ainda não tem teto automático.

## O que fazer, em ordem

1. **Feche o Cursor por completo** (File → Exit e o ícone da bandeja). Mexer em `state.vscdb` com o editor aberto corrompe chats.
2. No Cursor, `Ctrl+Shift+P`:
   - `Developer: GC Agent KV Blobs` — limpa restos de agentes, não apaga chats.
   - `Developer: Delete Old Chats…` — apaga conversas antigas e compacta o banco. Apagar na sidebar **não** libera disco.
3. Rode `scripts/limpar-seguro.ps1` para backup, cache, logs MCP e Git Graph.
4. Se o C: continuar apertado, rode `scripts/mover-para-d.ps1` para jogar Roaming, Local e `~\.cursor` no D: via junction. O Cursor continua vendo os mesmos caminhos.

O compactar (`VACUUM`) de um `state.vscdb` de ~22 GiB precisa de ~22 GiB **livres**. Sem isso, mova para o D: primeiro.

## Scripts (Windows)

No PowerShell, na pasta `scripts/`:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\medir-cursor.ps1
.\limpar-seguro.ps1 -IncludeBackup -IncludeIndex -IncludeAgentWorker
.\mover-para-d.ps1 -DestRoot D:\CursorData
```

| Script | O que faz |
| --- | --- |
| `medir-cursor.ps1` | Soma Roaming, Local e `~\.cursor` e lista os maiores de `globalStorage` |
| `limpar-seguro.ps1` | Apaga cache/logs. Com flags: backup, índice e agent-worker. **Não** toca em `state.vscdb` |
| `mover-para-d.ps1` | `robocopy /MOVE` + `mklink /J`. Precisa do D: montado sempre que o Cursor abrir |

Não use pendrive como destino. Junction não é cópia: se o D: sumir, o banco quebra.

### Alternativa oficial

Atalho do Cursor → Destino:

```
"%LOCALAPPDATA%\Programs\Cursor\Cursor.exe" --user-data-dir "D:\CursorUserData"
```

Copie `%APPDATA%\Cursor` para essa pasta antes. Abrir pelo Iniciar antigo volta a gravar no C: — o junction evita isso.

## Rodar o guia no navegador

```bash
npm install
npm run dev
```

Abre em [http://127.0.0.1:43141](http://127.0.0.1:43141). Os `.ps1` também baixam pela UI.

## Não faça

- Apagar `state.vscdb` (ou o `-wal`) com o Cursor aberto, ou se quiser manter o histórico.
- Confiar que deletar chat na UI libera espaço.
- Mover só o `.exe` — os gigabytes estão no AppData, não no programa.
