export type Category = 'Sales' | 'Operations' | 'Marketing' | 'Finance'

export type SortField = 'name' | 'revenue' | 'activeUsers' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface DataRecord {
  id: number
  name: string
  category: Category
  region: string
  revenue: number
  activeUsers: number
  updatedAt: string
  tags: string[]
  notes?: string
}

export interface ExplorerFilters {
  query: string
  category: Category | 'All'
  minRevenue: number
  tags: string[]
}

export interface ExplorerSummary {
  totalRows: number
  totalRevenue: number
  totalUsers: number
  averageRevenue: number
  categoryTotals: Record<string, number>
}

export class SummaryBuilder {
  private rows: DataRecord[]

  constructor(rows: DataRecord[] = []) {
    this.rows = rows
  }

  setRows(rows: DataRecord[]): SummaryBuilder {
    this.rows = [...rows]
    return this
  }

  toObject(): ExplorerSummary {
    const categoryTotals = this.rows.reduce<Record<string, number>>((accumulator, { category }) => {
      accumulator[category] = (accumulator[category] ?? 0) + 1
      return accumulator
    }, {})

    const totalRevenue = this.rows.reduce((total, { revenue }) => total + revenue, 0)
    const totalUsers = this.rows.reduce((total, { activeUsers }) => total + activeUsers, 0)
    const totalRows = this.rows.length
    const averageRevenue = totalRows > 0 ? totalRevenue / totalRows : 0

    return {
      totalRows,
      totalRevenue,
      totalUsers,
      averageRevenue,
      categoryTotals,
    }
  }
}