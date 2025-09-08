// Lightweight service worker registration with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.info('[PWA] SW registered', reg.scope)
      if (reg.waiting) {
        // Optionally prompt user for refresh
        console.info('[PWA] Update ready')
      }
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing
        if (!nw) return
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            console.info('[PWA] New content available; reload to update.')
          }
        })
      })
    }).catch(err => console.warn('[PWA] SW registration failed', err))
  })
}
