export type KvizQ = {
  id: string
  pitanje: string
  odgovori: string[]  // 4 ponuđena
  tacan: number       // 0..3
  kategorija?: string // npr: 'fizika' | 'hemija' | 'psihologija' | 'latinske' | 'opsta' | 'koznazna'
}
