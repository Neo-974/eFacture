import * as fs from 'fs'
import * as path from 'path'
import { DemoState } from './types'
import { getSeedData } from './demo-seed'

const STORE_PATH = path.join(process.cwd(), 'demo-state.json')

export function readStore(): DemoState {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const seed = getSeedData()
      writeStore(seed)
      return seed
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8')
    return JSON.parse(raw) as DemoState
  } catch {
    const seed = getSeedData()
    writeStore(seed)
    return seed
  }
}

export function writeStore(state: DemoState): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf8')
}

export function updateStore(updater: (state: DemoState) => DemoState): DemoState {
  const current = readStore()
  const updated = updater(current)
  writeStore(updated)
  return updated
}
