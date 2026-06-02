import type { DataRecord } from './types.ts'

export const dataRecords: DataRecord[] = [
  {
    id: 1,
    name: 'Northwind Pro',
    category: 'Sales',
    region: 'North America',
    revenue: 182000,
    activeUsers: 4200,
    updatedAt: '2026-05-27',
    tags: ['enterprise', 'saas'],
    notes: 'High conversion from demo pipeline',
  },
  {
    id: 2,
    name: 'OrbitOps',
    category: 'Operations',
    region: 'Europe',
    revenue: 94000,
    activeUsers: 1300,
    updatedAt: '2026-05-30',
    tags: ['automation', 'internal'],
  },
  {
    id: 3,
    name: 'Campaign Spark',
    category: 'Marketing',
    region: 'Asia Pacific',
    revenue: 76000,
    activeUsers: 2100,
    updatedAt: '2026-04-19',
    tags: ['growth', 'email'],
    notes: 'Strong retention in mobile segment',
  },
  {
    id: 4,
    name: 'Ledger Flow',
    category: 'Finance',
    region: 'North America',
    revenue: 215000,
    activeUsers: 900,
    updatedAt: '2026-05-18',
    tags: ['compliance', 'audit'],
  },
  {
    id: 5,
    name: 'FieldPulse',
    category: 'Operations',
    region: 'Latin America',
    revenue: 128000,
    activeUsers: 1700,
    updatedAt: '2026-05-12',
    tags: ['logistics', 'mobile'],
    notes: 'Seasonal increase in Q2',
  },
  {
    id: 6,
    name: 'Insight Deck',
    category: 'Marketing',
    region: 'Europe',
    revenue: 143000,
    activeUsers: 2600,
    updatedAt: '2026-05-29',
    tags: ['analytics', 'dashboard'],
  },
  {
    id: 7,
    name: 'Quota Pilot',
    category: 'Sales',
    region: 'Asia Pacific',
    revenue: 165000,
    activeUsers: 3900,
    updatedAt: '2026-03-31',
    tags: ['forecasting', 'crm'],
  },
  {
    id: 8,
    name: 'Treasury Lens',
    category: 'Finance',
    region: 'Middle East',
    revenue: 87000,
    activeUsers: 640,
    updatedAt: '2026-05-08',
    tags: ['risk', 'planning'],
    notes: 'Pilot customers requested API access',
  },
]

const isDataRecord = (value: unknown): value is DataRecord => {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Partial<DataRecord>

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.region === 'string' &&
    typeof candidate.revenue === 'number' &&
    typeof candidate.activeUsers === 'number' &&
    typeof candidate.updatedAt === 'string' &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === 'string') &&
    (candidate.notes === undefined || typeof candidate.notes === 'string')
  )
}

export const loadDataRecords = async (): Promise<DataRecord[]> => {
  try {
    const payload: unknown = await Promise.resolve(dataRecords.map((record) => ({ ...record })))

    if (!Array.isArray(payload) || !payload.every(isDataRecord)) {
      throw new Error('Loaded data has an invalid shape.')
    }

    return payload
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown data loading error.'
    throw new Error(`Failed to load explorer records. ${message}`)
  }
}