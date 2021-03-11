(() => {
  // Inject Handsfree
  const $script = document.createElement('script')
  const $link = document.createElement('link')

  $script.src = 'https://unpkg.com/handsfree@8.4.3/build/lib/handsfree.js'

  $link.setAttribute('rel', 'stylesheet')
  $link.setAttribute('type', 'text/css')
  $link.setAttribute('href', 'https://unpkg.com/handsfree@8.4.3/build/lib/assets/handsfree.css')

  /**
   * Configure Handsfree.js
   */
  $script.onload = function () {
    handsfree = new Handsfree({
      showDebug: true,
      hands: true
    })
    handsfree.enablePlugins('browser')

    // Position fix the debugger
    handsfree.debug.$wrap.style.position = 'fixed'
    handsfree.debug.$wrap.style.width = '480px'
    handsfree.debug.$wrap.style.right = '0'
    handsfree.debug.$wrap.style.bottom = '0'
    handsfree.debug.$wrap.style.zIndex = '99999'

    /**
     * Click and drag sketchfabs
     */
    const eventMap = {
      start: 'mousedown',
      held: 'mousemove',
      released: 'mouseup'
    }
    
    handsfree.use('sketchfab', {
      onFrame: ({hands}) => {
        if (!hands.multiHandLandmarks) return
    
        hands.pointer.forEach((pointer, hand) => {
          if (pointer.isVisible && hands.pinchState[hand][0]) {
            // Get the event and element to send events to
            const event = eventMap[hands.pinchState[hand][0]]
            const $el = document.elementFromPoint(pointer.x, pointer.y)
            
            // Dispatch the event
            if ($el) {
              let $canvas
              
              // Find the canvas inside the iframe
              if ($el.tagName.toLocaleLowerCase() === 'canvas' && $el.classList.contains('canvas')) {
                $canvas = $el
              } else if ($el.tagName.toLocaleLowerCase() === 'iframe' && $el.src.startsWith('https://sketchfab.com/models')) {
                $canvas = $el.contentWindow.document.querySelector('canvas.canvas')
              }
    
              if ($canvas) {
                $canvas.dispatchEvent(
                  new MouseEvent(event, {
                    bubbles: true,
                    cancelable: true,
                    clientX: pointer.x,
                    clientY: pointer.y
                  })
                )  
              }
            }
          }
        })
      }
    })

    // Start Handsfree
    handsfree.start()
  }

  // Inject Handsfree.js
  document.head.appendChild($link)
  document.body.appendChild($script)
})()