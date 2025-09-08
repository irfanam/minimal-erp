export function exportJSON(data: any, filename = 'export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(rows: any[], filename = 'export.csv') {
  if (!rows.length) return
  const header = Object.keys(rows[0]).join(',')
  const body = rows.map(r => Object.values(r).map(v => JSON.stringify(v ?? '')).join(',')).join('\n')
  const csv = [header, body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
