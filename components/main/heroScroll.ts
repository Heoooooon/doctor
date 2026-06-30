export function scrollHeroToNextLayout(hero: HTMLElement): void {
  const rect = hero.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return

  const desktop = document.getElementById('home-desktop')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

  if (desktop && window.matchMedia('(min-width: 768px)').matches) {
    const wrapper = hero.parentElement
    const target = wrapper?.nextElementSibling
    const top = target instanceof HTMLElement ? target.offsetTop : desktop.clientHeight
    desktop.scrollTo({ top, behavior })
    return
  }

  const target = hero.nextElementSibling
  const top = target instanceof HTMLElement
    ? target.getBoundingClientRect().top + window.scrollY
    : window.innerHeight
  window.scrollTo({ top, behavior })
}
