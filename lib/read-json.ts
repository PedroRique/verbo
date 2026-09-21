import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { promisify } from "node:util"
import { gunzip } from "node:zlib"

const unzip = promisify(gunzip)

export async function readJsonFile<T>(fileNoExt: string): Promise<T> {
  const gz = `${fileNoExt}.json.gz`
  if (existsSync(gz)) {
    const buf = await unzip(await readFile(gz))
    return JSON.parse(buf.toString("utf8")) as T
  }
  return JSON.parse(await readFile(`${fileNoExt}.json`, "utf8")) as T
}
