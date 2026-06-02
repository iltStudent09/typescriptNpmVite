import './style.css'
import { loadDataRecords } from './data.ts'
import {
  applyFilters,
  formatCurrency,
  formatDate,
  getCategories,
  parseTags,
  sortRows,
} from './explorer.ts'
import { SummaryBuilder, type DataRecord, type ExplorerFilters, type SortDirection, type SortField } from './types.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root element #app was not found.')
}

const initialFilters: ExplorerFilters = {
  query: '',
  category: 'All',
  minRevenue: 0,
  tags: [],
}

const state = {
  filters: { ...initialFilters },
  sortField: 'revenue' as SortField,
  sortDirection: 'desc' as SortDirection,
  selectedId: null as number | null,
}

let records: DataRecord[] = []

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unknown error occurred.'

const parseMinRevenue = (value: string): number => {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error('Minimum revenue must be a valid number.')
  }

  return Math.max(0, parsed)
}

const initializeExplorer = async (): Promise<void> => {
  try {
    records = await loadDataRecords()
    const categories = ['All', ...getCategories(records)]

    app.innerHTML = `
      <main class="explorer">
        <header class="page-header">
          <h1>Data Explorer</h1>
          <p>Filter, sort, and inspect operational data with TypeScript modules.</p>
          <p id="statusMessage" class="status-message" role="status" aria-live="polite"></p>
        </header>

        <section class="controls" aria-label="Explorer controls">
          <label>
            Search
            <input id="searchInput" type="search" placeholder="Name, region, note, or tag" />
          </label>

          <label>
            Category
            <select id="categorySelect">
              ${categories.map((category) => `<option value="${category}">${category}</option>`).join('')}
            </select>
          </label>

          <label>
            Min revenue
            <input id="minRevenueInput" type="number" min="0" step="1000" value="0" />
          </label>

          <label>
            Tags
            <input id="tagsInput" type="text" placeholder="comma,separated,tags" />
          </label>

          <label>
            Sort by
            <select id="sortFieldSelect">
              <option value="revenue" selected>Revenue</option>
              <option value="activeUsers">Active Users</option>
              <option value="updatedAt">Updated Date</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label>
            Direction
            <select id="sortDirectionSelect">
              <option value="desc" selected>Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>

          <button id="resetButton" type="button">Reset filters</button>
        </section>

        <section id="summaryGrid" class="summary-grid" aria-live="polite"></section>

        <section class="grid-layout">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Region</th>
                  <th>Revenue</th>
                  <th>Users</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody id="recordsBody"></tbody>
            </table>
          </div>
          <aside id="detailsPanel" class="details-panel" aria-live="polite"></aside>
        </section>
      </main>
    `

    const searchInput = document.querySelector<HTMLInputElement>('#searchInput')
    const categorySelect = document.querySelector<HTMLSelectElement>('#categorySelect')
    const minRevenueInput = document.querySelector<HTMLInputElement>('#minRevenueInput')
    const tagsInput = document.querySelector<HTMLInputElement>('#tagsInput')
    const sortFieldSelect = document.querySelector<HTMLSelectElement>('#sortFieldSelect')
    const sortDirectionSelect = document.querySelector<HTMLSelectElement>('#sortDirectionSelect')
    const resetButton = document.querySelector<HTMLButtonElement>('#resetButton')
    const recordsBody = document.querySelector<HTMLTableSectionElement>('#recordsBody')
    const detailsPanel = document.querySelector<HTMLElement>('#detailsPanel')
    const summaryGrid = document.querySelector<HTMLElement>('#summaryGrid')
    const statusMessage = document.querySelector<HTMLElement>('#statusMessage')

    if (
      !searchInput ||
      !categorySelect ||
      !minRevenueInput ||
      !tagsInput ||
      !sortFieldSelect ||
      !sortDirectionSelect ||
      !resetButton ||
      !recordsBody ||
      !detailsPanel ||
      !summaryGrid ||
      !statusMessage
    ) {
      throw new Error('One or more required DOM elements are missing.')
    }

    const setStatus = (message = '', variant: 'default' | 'error' = 'default'): void => {
      statusMessage.textContent = message
      statusMessage.classList.toggle('error', variant === 'error')
    }

    const rowTemplate = ({ id, name, category, region, revenue, activeUsers, updatedAt }: DataRecord): string => `
  <tr data-id="${id}" class="${state.selectedId === id ? 'selected' : ''}">
    <td>${name}</td>
    <td>${category}</td>
    <td>${region}</td>
    <td>${formatCurrency(revenue)}</td>
    <td>${activeUsers.toLocaleString()}</td>
    <td>${formatDate(updatedAt)}</td>
  </tr>
`

    const renderSummary = (rows: DataRecord[]): void => {
      const summary = new SummaryBuilder().setRows(rows).toObject()
      const { totalRows, totalRevenue, totalUsers, averageRevenue, categoryTotals } = summary

      const totalsMarkup = Object.entries(categoryTotals)
        .map(([category, count]) => `<span>${category}: ${count}</span>`)
        .join('')

      summaryGrid.innerHTML = `
        <article><h2>Records</h2><p>${totalRows}</p></article>
        <article><h2>Total Revenue</h2><p>${formatCurrency(totalRevenue)}</p></article>
        <article><h2>Total Users</h2><p>${totalUsers.toLocaleString()}</p></article>
        <article><h2>Avg Revenue</h2><p>${formatCurrency(averageRevenue)}</p></article>
        <article class="wide"><h2>Category Breakdown</h2><div class="badge-row">${totalsMarkup || '<span>None</span>'}</div></article>
      `
    }

    const renderDetails = (row: DataRecord | null): void => {
      if (!row) {
        detailsPanel.innerHTML = '<h2>Details</h2><p>No matching record.</p>'
        return
      }

      const { name, category, region, revenue, activeUsers, updatedAt, tags, notes } = row
      detailsPanel.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Region:</strong> ${region}</p>
        <p><strong>Revenue:</strong> ${formatCurrency(revenue)}</p>
        <p><strong>Active Users:</strong> ${activeUsers.toLocaleString()}</p>
        <p><strong>Updated:</strong> ${formatDate(updatedAt)}</p>
        <p><strong>Tags:</strong> ${tags.join(', ') || 'n/a'}</p>
        <p><strong>Notes:</strong> ${notes ?? 'No notes available.'}</p>
      `
    }

    const renderTable = (rows: DataRecord[]): void => {
      recordsBody.innerHTML = rows.map((row) => rowTemplate(row)).join('')
    }

    const getRenderedRows = (): DataRecord[] => {
      const filtered = applyFilters(records, state.filters)
      return sortRows(filtered, state.sortField, state.sortDirection)
    }

    const renderAll = (): void => {
      const rows = getRenderedRows()

      if (!rows.some(({ id }) => id === state.selectedId)) {
        state.selectedId = rows[0]?.id ?? null
      }

      renderSummary(rows)
      renderTable(rows)
      renderDetails(rows.find(({ id }) => id === state.selectedId) ?? null)
    }

    const safelyRun = (action: () => void, failureContext: string): void => {
      try {
        action()
        setStatus('')
      } catch (error: unknown) {
        setStatus(`Could not ${failureContext}. ${getErrorMessage(error)}`, 'error')
      }
    }

    searchInput.addEventListener('input', () => {
      safelyRun(() => {
        state.filters.query = searchInput.value
        renderAll()
      }, 'apply search filter')
    })

    categorySelect.addEventListener('change', () => {
      safelyRun(() => {
        state.filters.category = categorySelect.value as ExplorerFilters['category']
        renderAll()
      }, 'change category filter')
    })

    minRevenueInput.addEventListener('input', () => {
      safelyRun(() => {
        state.filters.minRevenue = parseMinRevenue(minRevenueInput.value)
        renderAll()
      }, 'set minimum revenue')
    })

    tagsInput.addEventListener('input', () => {
      safelyRun(() => {
        state.filters.tags = parseTags(tagsInput.value)
        renderAll()
      }, 'apply tag filter')
    })

    sortFieldSelect.addEventListener('change', () => {
      safelyRun(() => {
        state.sortField = sortFieldSelect.value as SortField
        renderAll()
      }, 'change sort field')
    })

    sortDirectionSelect.addEventListener('change', () => {
      safelyRun(() => {
        state.sortDirection = sortDirectionSelect.value as SortDirection
        renderAll()
      }, 'change sort direction')
    })

    recordsBody.addEventListener('click', (event) => {
      safelyRun(() => {
        const target = event.target as HTMLElement
        const rowElement = target.closest<HTMLTableRowElement>('tr[data-id]')
        const id = Number(rowElement?.dataset.id ?? 0)

        if (!id) return

        state.selectedId = id
        renderAll()
      }, 'open record details')
    })

    resetButton.addEventListener('click', () => {
      safelyRun(() => {
        state.filters = { ...initialFilters }
        state.sortField = 'revenue'
        state.sortDirection = 'desc'
        state.selectedId = null

        searchInput.value = ''
        categorySelect.value = 'All'
        minRevenueInput.value = '0'
        tagsInput.value = ''
        sortFieldSelect.value = 'revenue'
        sortDirectionSelect.value = 'desc'

        renderAll()
      }, 'reset filters')
    })

    safelyRun(() => {
      renderAll()
    }, 'render data explorer')
  } catch (error: unknown) {
    app.innerHTML = `
      <main class="explorer">
        <header class="page-header">
          <h1>Data Explorer</h1>
          <p class="status-message error">Could not initialize explorer. ${getErrorMessage(error)}</p>
        </header>
      </main>
    `
  }
}

void initializeExplorer()
