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
    // Maps pinchStates to browser events
    const eventMap = {
      start: 'mousedown',
      held: 'mousemove',
      released: 'mouseup'
    }
    
    handsfree.use('sketchfab', {
      // The current canvas (set after rotation)
      $currentSketch: null,
      
      // The number of frames that a gesture has been held
      // @todo make this a feature of handsfree.js
      gestureLoops: {
        pointLeft: 0,
        pointRight: 0
      },

      /**
       * Runs on every frame
       */
      onFrame ({hands}) {
        if (!hands.pointer) return
    
        this.maybeRotate(hands)
        this.maybeClick(hands)
        this.maybeEscape(hands)
        this.maybePageAnnotations(hands)
      },

      /**
       * Rotate with right index
       */
      maybeRotate (hands) {
        // Pan the sketch
        if (hands.pointer[1].isVisible && hands.pinchState[1][0]) {
          // Get the event and element to send events to
          const event = eventMap[hands.pinchState[1][0]]
          const $el = document.elementFromPoint(hands.pointer[1].x, hands.pointer[1].y)
          
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
              this.$currentSketch = $canvas
              $canvas.dispatchEvent(
                new MouseEvent(event, {
                  bubbles: true,
                  cancelable: true,
                  clientX: hands.pointer[1].x,
                  clientY: hands.pointer[1].y
                })
              )  
            }
          }
        }
      },

      /**
       * Click on things with lef tindex
       */
      maybeClick (hands) {
        // Click on things
        if (hands.pinchState[1][0] === 'start' && hands.pointer[1].x) {
          const $el = document.elementFromPoint(hands.pointer[1].x, hands.pointer[1].y)
          if ($el && $el.classList.contains('c-model-360-preview')) {
            $el.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: hands.pointer[1].x,
                clientY: hands.pointer[1].y
              })
            )
          }
        }
      },

      /**
       * Trigger Esc with left pinky
       */
      maybeEscape (hands) {
        // Escape key
        if (hands.pinchState[0][3] === 'start') {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 27
          }))
        }
      },

      /**
       * Change annotations
       */
       maybePageAnnotations (hands) {
        // Point right
        if (hands.gesture[0]?.name === 'pointRight' && this.$currentSketch && this.gestureLoops.pointRight) {
          this.nextAnnotation()
          this.gestureLoops.pointRight = 0
        } else if (hands.gesture[0]?.name !== 'pointRight' || hands.gesture[1]?.name !== 'pointRight') {
          this.gestureLoops.pointRight++
        }

        // Point left
        if (hands.gesture[0]?.name === 'pointLeft' && this.$currentSketch && this.gestureLoops.pointLeft) {
          this.prevAnnotation()
          this.gestureLoops.pointLeft = 0
        } else if (hands.gesture[0]?.name !== 'pointLeft' || hands.gesture[1]?.name !== 'pointLeft') {
          this.gestureLoops.pointLeft++
        }
      },

      /**
       * Page annotations
       */
      prevAnnotation: handsfree.throttle(function () {
        this.$currentSketch.dispatchEvent(new KeyboardEvent('keypress', {
          bubbles: true,
          keyCode: 74
        }))
      }, 500, {trailing: false}),

      nextAnnotation: handsfree.throttle(function () {
        this.$currentSketch.dispatchEvent(new KeyboardEvent('keypress', {
          bubbles: true,
          keyCode: 75
        }))
      }, 500, {trailing: false})
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

    /**
     * Gestures
     */
    // Point right with two fingers 👉
    handsfree.useGesture({"name":"pointRight","algorithm":"fingerpose","models":"hands","confidence":7.5,"description":[["addCurl","Thumb","NoCurl",1],["addDirection","Thumb","HorizontalLeft",1],["addDirection","Thumb","DiagonalDownLeft",0.6666666666666666],["addCurl","Index","NoCurl",1],["addDirection","Index","HorizontalLeft",1],["addDirection","Index","DiagonalUpLeft",0.034482758620689655],["addCurl","Middle","NoCurl",1],["addDirection","Middle","HorizontalLeft",1],["addDirection","Middle","DiagonalUpLeft",0.07142857142857142],["addCurl","Ring","FullCurl",1],["addDirection","Ring","HorizontalLeft",1],["addCurl","Pinky","FullCurl",1],["addDirection","Pinky","HorizontalLeft",1],["addDirection","Pinky","DiagonalDownLeft",0.15384615384615385],["setWeight","Index",2],["setWeight","Middle",2]],"enabled":true})
    // Point left with two fingers 👈
    handsfree.useGesture({"name":"pointLeft","algorithm":"fingerpose","models":"hands","confidence":7.5,"description":[["addCurl","Thumb","NoCurl",0.42857142857142855],["addCurl","Thumb","HalfCurl",1],["addDirection","Thumb","HorizontalRight",1],["addCurl","Index","NoCurl",1],["addDirection","Index","HorizontalRight",1],["addDirection","Index","DiagonalUpRight",0.42857142857142855],["addCurl","Middle","NoCurl",1],["addDirection","Middle","HorizontalRight",1],["addDirection","Middle","DiagonalUpRight",0.42857142857142855],["addCurl","Ring","FullCurl",1],["addDirection","Ring","HorizontalRight",1],["addDirection","Ring","DiagonalUpRight",0.07142857142857142],["addCurl","Pinky","FullCurl",1],["addDirection","Pinky","HorizontalRight",1],["addDirection","Pinky","DiagonalDownRight",0.034482758620689655]]})

    // Start Handsfree
    handsfree.start()
  }

  // Inject Handsfree.js
  document.head.appendChild($link)
  document.body.appendChild($script)
})()