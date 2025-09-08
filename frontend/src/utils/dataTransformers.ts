// Data normalization / shaping helpers

export function toSelectOptions<T>(items: T[], getValue: (i: T) => string, getLabel: (i: T) => string) {
  return items.map(i => ({ value: getValue(i), label: getLabel(i) }))
}

export function indexBy<T extends Record<string, any>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, T>>((acc, item) => { acc[String(item[key])] = item; return acc }, {})
}

export function groupBy<T extends Record<string, any>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key])
    acc[k] = acc[k] || []
    acc[k].push(item)
    return acc
  }, {})
}
