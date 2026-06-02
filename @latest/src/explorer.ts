import type { DataRecord, ExplorerFilters, SortDirection, SortField } from './types.ts'

const normalize = (value = ''): string => value.trim().toLowerCase()

export const parseTags = (value = ''): string[] =>
  value
    .split(',')
    .map((item) => normalize(item))
    .filter(Boolean)

export const createTagMatcher = (...requiredTags: string[]) => {
  const normalizedTags = requiredTags.map((tag) => normalize(tag)).filter(Boolean)

  return (rowTags: string[]): boolean => {
    if (normalizedTags.length === 0) return true

    const normalizedRowTags = rowTags.map((tag) => normalize(tag))
    return normalizedTags.every((requiredTag) =>
      normalizedRowTags.some((rowTag) => rowTag.includes(requiredTag)),
    )
  }
}

export const getCategories = (rows: DataRecord[]): Array<DataRecord['category']> =>
  [...new Set(rows.map(({ category }) => category))]

export const applyFilters = (rows: DataRecord[], filters: ExplorerFilters): DataRecord[] => {
  const { query, category, minRevenue, tags } = filters
  const normalizedQuery = normalize(query)
  const tagMatcher = createTagMatcher(...tags)

  return rows.filter((row) => {
    const { name, region, revenue, category: rowCategory, tags: rowTags, notes } = row
    const searchPool = `${name} ${region} ${notes ?? ''} ${rowTags.join(' ')}`.toLowerCase()
    const queryMatch = normalizedQuery.length === 0 || searchPool.includes(normalizedQuery)
    const categoryMatch = category === 'All' || rowCategory === category
    const revenueMatch = revenue >= minRevenue
    const tagMatch = tagMatcher(rowTags)
    return queryMatch && categoryMatch && revenueMatch && tagMatch
  })
}

const sorters: Record<SortField, (left: DataRecord, right: DataRecord) => number> = {
  name: (left, right) => left.name.localeCompare(right.name),
  revenue: (left, right) => left.revenue - right.revenue,
  activeUsers: (left, right) => left.activeUsers - right.activeUsers,
  updatedAt: (left, right) => new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime(),
}

export const sortRows = (
  rows: DataRecord[],
  field: SortField,
  direction: SortDirection = 'desc',
): DataRecord[] => {
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((left, right) => factor * sorters[field](left, right))
}

export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  )

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
