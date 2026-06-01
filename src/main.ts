import './style.css'

type DataPoint = {
  id: number
  name: string
  category: 'Finance' | 'Health' | 'Education'
  region: 'North' | 'South' | 'East' | 'West'
  score: number
  updatedAt: string
}

const data: DataPoint[] = [
  { id: 1, name: 'Student Growth Index', category: 'Education', region: 'North', score: 82, updatedAt: '2026-05-22' },
  { id: 2, name: 'Clinic Wait Times', category: 'Health', region: 'West', score: 61, updatedAt: '2026-05-28' },
  { id: 3, name: 'City Budget Balance', category: 'Finance', region: 'South', score: 74, updatedAt: '2026-04-29' },
  { id: 4, name: 'Graduation Rate', category: 'Education', region: 'East', score: 88, updatedAt: '2026-05-30' },
  { id: 5, name: 'Public Health Coverage', category: 'Health', region: 'South', score: 79, updatedAt: '2026-05-26' },
  { id: 6, name: 'Small Business Loans', category: 'Finance', region: 'North', score: 68, updatedAt: '2026-05-12' },
  { id: 7, name: 'Teacher Retention', category: 'Education', region: 'West', score: 71, updatedAt: '2026-05-20' },
  { id: 8, name: 'Emergency Response', category: 'Health', region: 'East', score: 84, updatedAt: '2026-05-31' },
]

const categories = ['All', ...new Set(data.map((item) => item.category))]

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="explorer">
    <header>
      <h1>Interactive Data Explorer</h1>
      <p>Search, filter, and inspect sample TypeScript-powered records.</p>
    </header>

    <section class="controls" aria-label="Data controls">
      <label>
        Search
        <input id="search" type="search" placeholder="Search by name or region" />
      </label>

      <label>
        Category
        <select id="category">
          ${categories.map((category) => `<option value="${category}">${category}</option>`).join('')}
        </select>
      </label>

      <label>
        Sort by
        <select id="sortBy">
          <option value="score-desc">Score (high to low)</option>
          <option value="score-asc">Score (low to high)</option>
          <option value="name-asc">Name (A-Z)</option>
        </select>
      </label>
    </section>

    <section class="content">
      <table aria-label="Data records">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Region</th>
            <th>Score</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>

      <aside class="detail" aria-live="polite">
        <h2>Selected record</h2>
        <p id="detailText">Select a row to view more details.</p>
      </aside>
    </section>
  </main>
`

const searchInput = document.querySelector<HTMLInputElement>('#search')
const categorySelect = document.querySelector<HTMLSelectElement>('#category')
const sortSelect = document.querySelector<HTMLSelectElement>('#sortBy')
const rows = document.querySelector<HTMLTableSectionElement>('#rows')
const detailText = document.querySelector<HTMLParagraphElement>('#detailText')

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const getVisibleData = (): DataPoint[] => {
  const searchTerm = searchInput?.value.trim().toLowerCase() ?? ''
  const selectedCategory = categorySelect?.value ?? 'All'
  const sortBy = sortSelect?.value ?? 'score-desc'

  const filtered = data.filter((item) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.region.toLowerCase().includes(searchTerm)
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  filtered.sort((a, b) => {
    if (sortBy === 'score-asc') return a.score - b.score
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    return b.score - a.score
  })

  return filtered
}

const renderRows = (): void => {
  if (!rows) return

  const visible = getVisibleData()
  if (visible.length === 0) {
    rows.innerHTML = '<tr><td colspan="5" class="empty">No records match your filters.</td></tr>'
    return
  }

  rows.innerHTML = visible
    .map(
      (item) => `
      <tr>
        <td><button class="rowButton" type="button" data-id="${item.id}">${escapeHtml(item.name)}</button></td>
        <td>${item.category}</td>
        <td>${item.region}</td>
        <td>${item.score}</td>
        <td>${item.updatedAt}</td>
      </tr>
    `,
    )
    .join('')
}

const showDetail = (id: number): void => {
  const selected = data.find((item) => item.id === id)
  if (!selected || !detailText) return

  detailText.textContent = `${selected.name} is a ${selected.category} record for the ${selected.region} region with a score of ${selected.score}. Last updated ${selected.updatedAt}.`
}

searchInput?.addEventListener('input', renderRows)
categorySelect?.addEventListener('change', renderRows)
sortSelect?.addEventListener('change', renderRows)
rows?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const button = target.closest<HTMLButtonElement>('.rowButton')
  if (!button) return
  showDetail(Number(button.dataset.id))
})

renderRows()
