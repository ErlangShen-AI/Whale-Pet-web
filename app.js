/* 页面文案取自软件仓库的 README（由 sync-apk.yml 同步到 downloads/upstream-readme.md），
   版本与发布日志取自 latest.json 与 release-notes.md，页面本身不硬编码这些内容。 */

const ICONS = {
  drag: '<path d="M12 3v18M3 12h18M12 3 9 6M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  mirror:
    '<path d="M12 4v16"/><path d="M8 8 4 12l4 4"/><path d="M16 8l4 4-4 4"/><path d="M4 12h4M16 12h4"/>',
  press:
    '<path d="M12 21a9 9 0 1 0-9-9v.5"/><path d="M12 21a5 5 0 0 0 5-5V8.5"/><path d="M7 12h5"/>',
  bubble:
    '<path d="M21 12a8 8 0 0 1-8 8H8l-4 3v-5.5A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z"/><circle cx="10" cy="12" r="1"/><circle cx="14" cy="12" r="1"/>',
  wallet:
    '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/><path d="M4 10h16"/><circle cx="16" cy="14" r="1.2"/>',
  cost: '<path d="M12 4v10"/><path d="M8 10l4 4 4-4"/><path d="M5 19h14"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  edit: '<path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="M13.5 6.5l4 4"/>',
  quote:
    '<path d="M7 7h4v6H7a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1Z"/><path d="M15 7h4v6h-4a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1Z"/><path d="M9 13v5a3 3 0 0 0 3 3"/>',
  sound: '<path d="M4 10v4h3l4 4V6L7 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6.5a8 8 0 0 1 0 11"/>',
  theme: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/><circle cx="12" cy="12" r="9" opacity=".25"/>',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 8.2-7 9-4-.8-7-4.6-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/>',
  sparkle:
    '<path d="M12 3l1.9 5.3L19 10.2l-5.1 1.9L12 17.4l-1.9-5.3L5 10.2l5.1-1.9L12 3Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>'
}

const pickIcon = (title) => {
  const text = title.toLowerCase()
  if (/(拖动|悬浮|移动|位置)/.test(text)) return ICONS.drag
  if (/(镜像|翻转|左缘|贴边)/.test(text)) return ICONS.mirror
  if (/(按压|回弹|q 弹)/.test(text)) return ICONS.press
  if (/(气泡|椭圆)/.test(text)) return ICONS.bubble
  if (/(余额|账户|钱包)/.test(text)) return ICONS.wallet
  if (/(消耗|对话|花钱)/.test(text)) return ICONS.cost
  if (/(用量|今日|记账|定价|峰谷)/.test(text)) return ICONS.chart
  if (/(自定义|替代|文本)/.test(text)) return ICONS.edit
  if (/(台词|随机|卖萌)/.test(text)) return ICONS.quote
  if (/(音效|声音)/.test(text)) return ICONS.sound
  if (/(主题|自适应|字号|旋转|深浅)/.test(text)) return ICONS.theme
  if (/(权限|授权|安全)/.test(text)) return ICONS.shield
  return ICONS.sparkle
}

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** 从上游 README 切出某个标题到下一个同级或更高级标题之间的正文，层级默认二级。 */
const sliceSection = (markdown, title, level = 2) => {
  const prefix = '#'.repeat(level)
  const start = markdown.search(new RegExp(`^${prefix}\\s+${title}\\s*$`, 'm'))
  if (start < 0) return ''
  const body = markdown.slice(start).replace(new RegExp(`^${prefix}\\s+.*$`, 'm'), '')
  const next = body.search(new RegExp(`^#{1,${level}}\\s+`, 'm'))
  return (next < 0 ? body : body.slice(0, next)).trim()
}

/** 按首个冒号拆「标题：正文」，链接协议里的冒号不参与拆分。 */
const splitLabel = (text) => {
  let cut = text.search(/[：:]/)
  while (cut > 0 && /https?$/.test(text.slice(0, cut))) {
    const rest = text.slice(cut + 1)
    const next = rest.search(/[：:]/)
    cut = next < 0 ? -1 : cut + 1 + next
  }
  if (cut < 1) return { title: text, body: '' }
  return { title: text.slice(0, cut).trim(), body: text.slice(cut + 1).trim() }
}

/** 去掉列表前缀后按 splitLabel 拆分。 */
const splitBullet = (line) => splitLabel(line.replace(/^[-*]\s+/, '').trim())

/** markdown 表格转行，第一行当表头。 */
const parseTable = (section) => {
  const lines = section.split('\n').filter((line) => line.trim().startsWith('|'))
  if (lines.length < 2) return []
  return lines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((_cell, index, array) => index > 0 && index < array.length - 1)
    return { key: cells[0] || '', value: cells[1] || '' }
  })
}

/** 行内加粗、斜体、代码与链接转 HTML，其他字符转义，避免引入完整 markdown 依赖。 */
const rich = (text) => {
  let out = esc(text)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" rel="noopener" target="_blank">$1</a>'
  )
  return out
}

/** 读取同步过来的文件，失败返回空字符串，页面保留静态兜底内容。 */
const readText = async (path) => {
  try {
    const response = await fetch(path, { cache: 'no-store' })
    return response.ok ? await response.text() : ''
  } catch (_error) {
    return ''
  }
}

const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

const fillDownloadFacts = async () => {
  const buttonMeta = document.querySelector('[data-download-meta]')
  const facts = document.querySelector('[data-download-facts]')
  let data = null
  try {
    const response = await fetch('downloads/latest.json', { cache: 'no-store' })
    if (response.ok) data = await response.json()
  } catch (_error) {
    data = null
  }
  if (!data) return
  if (buttonMeta && data.version) buttonMeta.textContent = `v${data.version}`
  if (!facts) return
  const values = {
    version: data.version ? `v${data.version}` : null,
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

const fillFeatures = (readme) => {
  const host = document.querySelector('[data-cards]')
  if (!host) return
  const section = sliceSection(readme, '特性')
  if (!section) return
  const items = section
    .split('\n')
    .filter((line) => /^[-*]\s+/.test(line.trim()))
    .map(splitBullet)
    .filter((item) => item.title)
  if (!items.length) return
  host.innerHTML = items
    .map(
      (item) => `
      <li class="card">
        <span class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">${pickIcon(item.title)}</svg>
        </span>
        <h3>${rich(item.title)}</h3>
        ${item.body ? `<p>${rich(item.body)}</p>` : ''}
      </li>`
    )
    .join('')
}

const fillRows = (readme) => {
  const host = document.querySelector('[data-rows]')
  if (!host) return
  const rows = parseTable(sliceSection(readme, '交互'))
  if (!rows.length) return
  host.innerHTML = rows
    .map(
      (row) => `
      <div class="row">
        <dt>${esc(row.key)}</dt>
        <dd>${rich(row.value)}</dd>
      </div>`
    )
    .join('')
}

const fillSteps = (readme) => {
  const host = document.querySelector('[data-steps]')
  if (!host) return
  const section = sliceSection(readme, '安装')
  if (!section) return
  const table = parseTable(section)
  const items = table.length
    ? table.map((row) => ({ title: row.key, body: row.value }))
    : section
        .split('\n')
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => splitLabel(line.replace(/^\d+\.\s*/, '').trim()))
  if (!items.length) return
  host.innerHTML = items
    .map((item) => {
      // 上游 README 的安装步骤把本站写成「官网」，本页就是官网，改成指向自身
      const title = (item.title || '').replace(/官网/g, '本页')
      const body = (item.body || '').replace(/官网/g, '本页')
      // 只有一句说明的步骤按正文排，分标题与正文的步骤排成两段
      return body
        ? `
      <li>
        <h3>${rich(title)}</h3>
        <p>${rich(body)}</p>
      </li>`
        : `
      <li>
        <p class="step-line">${rich(title)}</p>
      </li>`
    })
    .join('')
}

const fillPermissions = (readme) => {
  const host = document.querySelector('[data-rows-permissions]')
  if (!host) return
  const rows = parseTable(sliceSection(readme, '权限说明'))
  if (!rows.length) return
  host.innerHTML = rows
    .map(
      (row) => `
      <div class="row">
        <dt>${rich(row.key)}</dt>
        <dd>${rich(row.value)}</dd>
      </div>`
    )
    .join('')
}

const fillPoints = (readme, key, sectionTitle) => {
  const host = document.querySelector(`[data-points="${key}"]`)
  if (!host) return
  const section = sliceSection(readme, sectionTitle)
  if (!section) return
  const lines = section
    .split('\n')
    .filter((line) => /^[-*]\s+/.test(line.trim()))
    .map((line) => line.trim())
  if (!lines.length) return
  host.innerHTML = lines.map((line) => `<li>${rich(line.replace(/^[-*]\s+/, ''))}</li>`).join('')
}

/** 段落性质的补充说明，按小节取表格与列表之后的那段文字。 */
const fillNotes = (readme) => {
  const targets = {
    interactions: ['交互', 2],
    install: ['安装', 2],
    permissions: ['权限说明', 2],
    design: ['设计说明', 2],
    credits: ['许可', 3]
  }
  for (const key of Object.keys(targets)) {
    const node = document.querySelector(`[data-note="${key}"]`)
    if (!node) continue
    const [title, level] = targets[key]
    const section = sliceSection(readme, title, level)
    if (!section) continue
    const paragraph = section
      .split('\n\n')
      .map((block) => block.trim())
      // 只取真正的段落，列表、表格、代码块都排除，避免与步骤卡片重复
      .filter(
        (block) =>
          block && !block.startsWith('|') && !/^[-*]\s+/.test(block) && !/^\d+\.\s+/.test(block)
      )
      .filter((block) => !/^```/.test(block))
    const text = paragraph[paragraph.length - 1]
    if (text) node.innerHTML = rich(text)
  }
}

const fillCredits = (readme) => {
  const lead = document.querySelector('[data-credits-lead]')
  if (lead) {
    const section = sliceSection(readme, '致谢与许可')
    if (section) {
      // 取第一段真正的正文，跳过子标题与列表
      const block = section
        .split('\n\n')
        .map((part) => part.trim())
        .find(
          (part) =>
            part && !/^#{1,6}\s/.test(part) && !/^[-*]\s+/.test(part) && !part.startsWith('|')
        )
      if (block) lead.innerHTML = rich(block)
    }
  }
  const origin = document.querySelector('[data-tile-origin]')
  const android = document.querySelector('[data-tile-android]')
  if (origin) {
    const section = sliceSection(readme, '致谢与许可')
    if (section) {
      const match = section.match(
        /\[([^\]]+)\]\(https:\/\/github\.com\/MeteorNOX\/DeepSeek-Balance-Whale-Widget\)/
      )
      if (match) origin.textContent = match[1]
    }
  }
  if (android) {
    const section = sliceSection(readme, '目录结构')
    if (section) {
      const match = section.match(/小鲸鱼桌宠[^\n]*/)
      if (match) android.textContent = match[0]
    }
  }
}

/** 发布页正文只有标题、列表与分隔线，这里做对应的子集渲染。
    与小节标题重复的二级标题不再渲染一遍。 */
const renderReleaseNotes = (notes, skipTitles = []) => {
  const lines = notes.replace(/\r/g, '').split('\n')
  let html = ''
  let inList = false
  const closeList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }
    if (/^---+$/.test(line.trim())) {
      closeList()
      html += '<hr />'
      continue
    }
    const heading = line.match(/^#{2,3}\s+(.*)$/)
    if (heading) {
      closeList()
      const title = heading[1].trim()
      if (skipTitles.includes(title)) continue
      const level = line.startsWith('### ') ? 3 : 2
      html += `<h${level} class="changelog-title">${esc(title)}</h${level === 2 ? 2 : 3}>`
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html += '<ul class="changelog-list">'
        inList = true
      }
      html += `<li>${rich(line.replace(/^[-*]\s+/, ''))}</li>`
      continue
    }
    closeList()
    html += `<p>${rich(line)}</p>`
  }
  closeList()
  return html
}

const fillChangelog = async () => {
  const host = document.querySelector('[data-changelog]')
  if (!host) return
  const notes = await readText('downloads/release-notes.md')
  if (!notes) return
  const section = host.closest('.section')
  const pageTitle = section?.querySelector('h2')?.textContent.trim()
  const html = renderReleaseNotes(notes, pageTitle ? [pageTitle] : [])
  if (html.trim()) host.innerHTML = html
}

/** 许可证全文来自上游仓库的 LICENSE，同步到 downloads/upstream-license.txt。 */
const fillLicense = async () => {
  const details = document.querySelector('[data-license]')
  const body = document.querySelector('[data-license-body]')
  if (!details || !body) return
  const text = await readText('downloads/upstream-license.txt')
  if (!text) return
  body.textContent = text.trim()
  details.hidden = false
}

/** 导航条目由页面里登记的小节生成，不在脚本里维护列表。 */
const buildNav = () => {
  const host = document.querySelector('[data-nav-links]')
  if (!host) return
  const items = [...document.querySelectorAll('[data-nav-item]')]
  host.innerHTML = items
    .map((section) => {
      const title = section.dataset.navItem
      return `<a href="#${section.id}">${esc(title)}</a>`
    })
    .join('')
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

const syncNav = () => {
  const nav = document.querySelector('[data-nav]')
  if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 0)
}

/** 导航高亮：滚动到哪一小节，对应链接亮起 */
const observeSections = () => {
  const sections = [...document.querySelectorAll('[data-section-title]')]
  if (!('IntersectionObserver' in window) || !sections.length) return
  const navLinks = [...document.querySelectorAll('.nav-links a')]
  const scroller = document.querySelector('.nav-links')
  const mark = (id) => {
    for (const link of navLinks) {
      const active = link.getAttribute('href') === `#${id}`
      link.classList.toggle('is-active', active)
      // 窄屏导航横向滚动，亮起的一项始终滚回视野中心
      if (active && scroller && scroller.scrollWidth > scroller.clientWidth) {
        link.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
      }
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) mark(entry.target.id)
      }
    },
    { rootMargin: '-30% 0px -60% 0px' }
  )
  sections.forEach((section) => observer.observe(section))
}

/** 元素滚进视口时淡入升起，同屏出现的一组按文档顺序错开 */
const observeReveals = () => {
  const targets = [...document.querySelectorAll('[data-reveal]')]
  if (!targets.length) return
  if (!('IntersectionObserver' in window)) {
    targets.forEach((node) => node.classList.add('is-visible'))
    return
  }
  let callbacks = 0
  const observer = new IntersectionObserver(
    (entries) => {
      callbacks += 1
      const arrived = []
      for (const entry of entries) {
        // 只处理进入视口的元素，其余留待后续回调
        if (!entry.isIntersecting) continue
        arrived.push(entry.target)
        observer.unobserve(entry.target)
      }
      arrived.sort((a, b) => targets.indexOf(a) - targets.indexOf(b))
      arrived.forEach((node, index) => {
        node.style.transitionDelay = `${Math.min(index, 3) * 70}ms`
        node.classList.add('is-visible')
        node.addEventListener(
          'transitionend',
          () => {
            node.style.transitionDelay = ''
          },
          { once: true }
        )
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  targets.forEach((node) => observer.observe(node))
  // 环境不派发观察器回调时，直接让所有小节落位，内容始终完整可见
  window.setTimeout(() => {
    if (callbacks === 0) targets.forEach((node) => node.classList.add('is-visible'))
  }, 3000)
}

/** 指针悬停时鲸鱼轻微跟随，位移按指数逼近收敛，离开视口或减弱动效时不运行 */
const attachPetParallax = () => {
  const hero = document.querySelector('.hero-inner')
  const pet = document.querySelector('.pet')
  if (!hero || !pet || !finePointer.matches || reducedMotion.matches) return
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  const reach = 14
  let raf = 0
  const tick = () => {
    current.x += (target.x - current.x) * 0.12
    current.y += (target.y - current.y) * 0.12
    const settled = Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05
    pet.style.transform = settled
      ? ''
      : `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`
    raf = settled ? 0 : requestAnimationFrame(tick)
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(tick)
  }
  hero.addEventListener('pointermove', (event) => {
    const box = hero.getBoundingClientRect()
    const dx = (event.clientX - box.left) / box.width - 0.5
    const dy = (event.clientY - box.top) / box.height - 0.5
    target.x = -dx * reach
    target.y = -dy * reach
    schedule()
  })
  hero.addEventListener('pointerleave', () => {
    target.x = 0
    target.y = 0
    schedule()
  })
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      target.x = 0
      target.y = 0
      pet.style.transform = ''
    }
  })
}

const main = async () => {
  // 加 js 类后揭示位移才生效，脚本不可用时内容保持原位完整可见
  document.documentElement.classList.add('js')
  buildNav()
  observeSections()
  observeReveals()
  attachPetParallax()
  syncNav()
  window.addEventListener('scroll', syncNav, { passive: true })

  fillDownloadFacts()
  fillChangelog()
  fillLicense()

  const readme = await readText('downloads/upstream-readme.md')
  if (!readme) return
  fillFeatures(readme)
  fillRows(readme)
  fillSteps(readme)
  fillPermissions(readme)
  fillPoints(readme, 'design', '设计说明')
  fillPoints(readme, 'limits', '已知限制')
  fillNotes(readme)
  fillCredits(readme)
}

main()
