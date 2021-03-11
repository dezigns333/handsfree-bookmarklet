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
    
        // Pan the sketch
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

          // Click on things
          // if (hands.pinchState[0][0] === 'start' && pointer.x) {
          //   const $el = document.elementFromPoint(pointer.x, pointer.y)
          //   if ($el) {
          //     $el.dispatchEvent(
          //       new MouseEvent('click', {
          //         bubbles: true,
          //         cancelable: true,
          //         clientX: pointer.x,
          //         clientY: pointer.y
          //       })
          //     )
          //   }
          // }
        })
      }
    })

    /**
     * Update pinch scroll so that it only works with left hand
     */
    handsfree.plugin.pinchScroll.onFrame = function ({hands}) {
      // Wait for other plugins to update
      setTimeout(() => {
        if (!hands.pointer) return
        const height = this.handsfree.debug.$canvas.hands.height
        const width = this.handsfree.debug.$canvas.hands.width
    
        hands.pointer.forEach((pointer, n) => {
          // Only left hand
          console.log('scroll')
          if (n) return
          
          // @fixme Get rid of n > origPinch.length
          if (!pointer.isVisible || n > hands.origPinch.length) return
    
          // Start scroll
          if (hands.pinchState[n]?.[0] === 'start') {
            let $potTarget = document.elementFromPoint(pointer.x, pointer.y)
    
            this.$target[n] = this.getTarget($potTarget)
            this.tweenScroll[n].x = this.origScrollLeft[n] = this.getTargetScrollLeft(this.$target[n])
            this.tweenScroll[n].y = this.origScrollTop[n] = this.getTargetScrollTop(this.$target[n])
            this.handsfree.TweenMax.killTweensOf(this.tweenScroll[n])
          }
    
          if (hands.pinchState[n]?.[0] === 'held' && this.$target[n]) {
            // With this one it continuously moves based on the pinch drag distance
            this.handsfree.TweenMax.to(this.tweenScroll[n], 1, {
              x: this.tweenScroll[n].x - (hands.origPinch[n][0].x - hands.curPinch[n][0].x) * width * this.config.speed,
              y: this.tweenScroll[n].y + (hands.origPinch[n][0].y - hands.curPinch[n][0].y) * height * this.config.speed,
              overwrite: true,
              ease: 'linear.easeNone',
              immediateRender: true  
            })
    
            this.$target[n].scrollTo(this.tweenScroll[n].x, this.tweenScroll[n].y)
          }
        })
      })
    }

    // Start Handsfree
    handsfree.start()
  }

  // Inject Handsfree.js
  document.head.appendChild($link)
  document.body.appendChild($script)
})()