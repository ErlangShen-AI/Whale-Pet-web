const nav = document.querySelector('.nav')

const syncNav = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 0)
}

syncNav()
window.addEventListener('scroll', syncNav, { passive: true })

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return null
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}

const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const buttonMeta = document.querySelector('[data-download-meta]')
const facts = document.querySelector('[data-download-facts]')

const fillFacts = (data) => {
  if (!facts) return
  const values = {
    version: data.version ? `v${data.version}` : null,
    size: formatSize(data.size),
    updated: formatDate(data.updatedAt)
  }
  let filled = false
  for (const key of Object.keys(values)) {
    const node = facts.querySelector(`[data-fact="${key}"]`)
    const value = values[key]
    if (!node || !value) continue
    node.textContent = value
    filled = true
  }
  if (filled) facts.hidden = false
}

fetch('downloads/latest.json', { cache: 'no-store' })
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('missing'))))
  .then((data) => {
    if (buttonMeta && data.version) buttonMeta.textContent = `v${data.version}`
    fillFacts(data)
  })
  .catch(() => {})
