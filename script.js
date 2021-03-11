(() => {
  // Inject Handsfree
  const $script = document.createElement('script')
  const $link = document.createElement('link')

  $script.src = 'https://unpkg.com/handsfree@8.4.3/build/lib/handsfree.js'

  $link.setAttribute('rel', 'stylesheet')
  $link.setAttribute('type', 'text/css')
  $link.setAttribute('href', 'https://unpkg.com/handsfree@8.4.3/build/lib/assets/handsfree.css')

  // Setup Handsfree
  $script.onload = function () {
    handsfree = new Handsfree({
      showDebug: true,
      hands: true
    })
    handsfree.enablePlugins('browser')
    handsfree.start()

    // Position fix the debugger
    handsfree.debug.$wrap.style.position = 'fixed'
    handsfree.debug.$wrap.style.width = '480px'
    handsfree.debug.$wrap.style.right = '0'
    handsfree.debug.$wrap.style.bottom = '0'
    handsfree.debug.$wrap.style.zIndex = '99999'
  }

  document.head.appendChild($link)
  document.body.appendChild($script)
})()