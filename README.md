# The Handsfree Bookmarklet

> 🚧 This is a very early prototype and may be buggy 🚧

![A video of a person browsing Sketchfab.com by making various hand gestures through a webcam](https://media2.giphy.com/media/7u6xX5CpvEm2Jwge6I/giphy.gif)

A bookmarklet that helps you interact with pages handsfree.

This bookmarklet currently only works on Sketchfab.com. Features include:

- Scroll pages by pinching your left index and thumb 👌 and moving your pinched hand up and down
- Click cards by pinching your right index and thumb
- Pan sketches by pinching your right index and thumb and dragging
- Escape a Sketch inside a popup by pinching your left pinky and thumb

## Browser Support

- Chrome
- Firefox
- Edge
- ❌ Does not work on mobile devices yet

## How does this work?

1. This is a simple script that loads [Handsfree.js](https://handsfree.js.org) into the current page. See the commented code in `/script.js`
2. When clicked on a page, it'll inject the Handsfree.js from [the CDN](https://unpkg.com/handsfree)
3. That's it :)

## Why?

[See my master plan](https://handsfreejs.org/about/)

## Roadmap

- Add a progress bar or loader
- Add a code editor so that you can script custom plugins and save them to localStorage
- Make it work with the Handsfree Plugin Repository so that you don't need to update the bookmarklet
- Make it work generally (so that you get basic functionality on every site)

## Links to try
- [Sketchfab.com](Sketchfab.com) - For the best experience, visit an [Explore](https://sketchfab.com/3d-models?sort_by=-likeCount) or [Search](https://sketchfab.com/search?q=museum&sort_by=-relevance&type=models) page, that way you can try multiple sketches at once

## How to build the bookmarklet yourself

1. Right click bookmark bar and click <kbd>Add Page...</kbd>
2. In the URL field, paste the below code
3. Click the bookmarklet when on a page (for now just on Sketchfab.com)
4. If you'd rather build the bookmarklet yourself from the source then copy paste `./script.js` into a [Bookmarklet Maker like this one](https://caiorss.github.io/bookmarklet-maker/) and use the generated code

## Bookmarklet code

```js
javascript:(function()%7B(() %3D> %7B%0A  %2F%2F Inject Handsfree%0A  const %24script %3D document.createElement('script')%0A  const %24link %3D document.createElement('link')%0A%0A  %24script.src %3D 'https%3A%2F%2Funpkg.com%2Fhandsfree%408.4.3%2Fbuild%2Flib%2Fhandsfree.js'%0A%0A  %24link.setAttribute('rel'%2C 'stylesheet')%0A  %24link.setAttribute('type'%2C 'text%2Fcss')%0A  %24link.setAttribute('href'%2C 'https%3A%2F%2Funpkg.com%2Fhandsfree%408.4.3%2Fbuild%2Flib%2Fassets%2Fhandsfree.css')%0A%0A  %2F**%0A   * Configure Handsfree.js%0A   *%2F%0A  %24script.onload %3D function () %7B%0A    handsfree %3D new Handsfree(%7B%0A      showDebug%3A true%2C%0A      hands%3A true%0A    %7D)%0A    handsfree.enablePlugins('browser')%0A%0A    %2F%2F Position fix the debugger%0A    handsfree.debug.%24wrap.style.position %3D 'fixed'%0A    handsfree.debug.%24wrap.style.width %3D '480px'%0A    handsfree.debug.%24wrap.style.right %3D '0'%0A    handsfree.debug.%24wrap.style.bottom %3D '0'%0A    handsfree.debug.%24wrap.style.zIndex %3D '99999'%0A%0A    %2F**%0A     * Click and drag sketchfabs%0A     *%2F%0A    const eventMap %3D %7B%0A      start%3A 'mousedown'%2C%0A      held%3A 'mousemove'%2C%0A      released%3A 'mouseup'%0A    %7D%0A    handsfree.use('sketchfab'%2C %7B%0A      onFrame%3A (%7Bhands%7D) %3D> %7B%0A        if (!hands.pointer) return%0A    %0A        %2F%2F Pan the sketch%0A        if (hands.pointer%5B1%5D.isVisible %26%26 hands.pinchState%5B1%5D%5B0%5D) %7B%0A          %2F%2F Get the event and element to send events to%0A          const event %3D eventMap%5Bhands.pinchState%5B1%5D%5B0%5D%5D%0A          const %24el %3D document.elementFromPoint(hands.pointer%5B1%5D.x%2C hands.pointer%5B1%5D.y)%0A          %0A          %2F%2F Dispatch the event%0A          if (%24el) %7B%0A            let %24canvas%0A            %0A            %2F%2F Find the canvas inside the iframe%0A            if (%24el.tagName.toLocaleLowerCase() %3D%3D%3D 'canvas' %26%26 %24el.classList.contains('canvas')) %7B%0A              %24canvas %3D %24el%0A            %7D else if (%24el.tagName.toLocaleLowerCase() %3D%3D%3D 'iframe' %26%26 %24el.src.startsWith('https%3A%2F%2Fsketchfab.com%2Fmodels')) %7B%0A              %24canvas %3D %24el.contentWindow.document.querySelector('canvas.canvas')%0A            %7D%0A  %0A            if (%24canvas) %7B%0A              %24canvas.dispatchEvent(%0A                new MouseEvent(event%2C %7B%0A                  bubbles%3A true%2C%0A                  cancelable%3A true%2C%0A                  clientX%3A hands.pointer%5B1%5D.x%2C%0A                  clientY%3A hands.pointer%5B1%5D.y%0A                %7D)%0A              )  %0A            %7D%0A          %7D%0A        %7D%0A%0A        %2F%2F Click on things%0A        if (hands.pinchState%5B1%5D%5B0%5D %3D%3D%3D 'start' %26%26 hands.pointer%5B1%5D.x) %7B%0A          const %24el %3D document.elementFromPoint(hands.pointer%5B1%5D.x%2C hands.pointer%5B1%5D.y)%0A          console.log(%24el%2C 'click')%0A          if (%24el %26%26 %24el.classList.contains('c-model-360-preview')) %7B%0A            %24el.dispatchEvent(%0A              new MouseEvent('click'%2C %7B%0A                bubbles%3A true%2C%0A                cancelable%3A true%2C%0A                clientX%3A hands.pointer%5B1%5D.x%2C%0A                clientY%3A hands.pointer%5B1%5D.y%0A              %7D)%0A            )%0A          %7D%0A        %7D%0A%0A        %2F%2F Escape key%0A        if (hands.pinchState%5B0%5D%5B3%5D %3D%3D%3D 'start') %7B%0A          document.dispatchEvent(new KeyboardEvent('keydown'%2C %7B%0A            keyCode%3A 27%0A          %7D))%0A        %7D%0A      %7D%0A    %7D)%0A%0A    %2F**%0A     * Update pinch scroll so that it only works with left hand%0A     *%2F%0A    handsfree.plugin.pinchScroll.onFrame %3D function (%7Bhands%7D) %7B%0A      %2F%2F Wait for other plugins to update%0A      setTimeout(() %3D> %7B%0A        if (!hands.pointer) return%0A        const height %3D this.handsfree.debug.%24canvas.hands.height%0A        const width %3D this.handsfree.debug.%24canvas.hands.width%0A    %0A        hands.pointer.forEach((pointer%2C n) %3D> %7B%0A          %2F%2F Only left hand%0A          if (n) return%0A          %0A          %2F%2F %40fixme Get rid of n > origPinch.length%0A          if (!pointer.isVisible %7C%7C n > hands.origPinch.length) return%0A    %0A          %2F%2F Start scroll%0A          if (hands.pinchState%5Bn%5D%3F.%5B0%5D %3D%3D%3D 'start') %7B%0A            let %24potTarget %3D document.elementFromPoint(pointer.x%2C pointer.y)%0A    %0A            this.%24target%5Bn%5D %3D this.getTarget(%24potTarget)%0A            this.tweenScroll%5Bn%5D.x %3D this.origScrollLeft%5Bn%5D %3D this.getTargetScrollLeft(this.%24target%5Bn%5D)%0A            this.tweenScroll%5Bn%5D.y %3D this.origScrollTop%5Bn%5D %3D this.getTargetScrollTop(this.%24target%5Bn%5D)%0A            this.handsfree.TweenMax.killTweensOf(this.tweenScroll%5Bn%5D)%0A          %7D%0A    %0A          if (hands.pinchState%5Bn%5D%3F.%5B0%5D %3D%3D%3D 'held' %26%26 this.%24target%5Bn%5D) %7B%0A            %2F%2F With this one it continuously moves based on the pinch drag distance%0A            this.handsfree.TweenMax.to(this.tweenScroll%5Bn%5D%2C 1%2C %7B%0A              x%3A this.tweenScroll%5Bn%5D.x - (hands.origPinch%5Bn%5D%5B0%5D.x - hands.curPinch%5Bn%5D%5B0%5D.x) * width * this.config.speed%2C%0A              y%3A this.tweenScroll%5Bn%5D.y %2B (hands.origPinch%5Bn%5D%5B0%5D.y - hands.curPinch%5Bn%5D%5B0%5D.y) * height * this.config.speed%2C%0A              overwrite%3A true%2C%0A              ease%3A 'linear.easeNone'%2C%0A              immediateRender%3A true  %0A            %7D)%0A    %0A            this.%24target%5Bn%5D.scrollTo(this.tweenScroll%5Bn%5D.x%2C this.tweenScroll%5Bn%5D.y)%0A          %7D%0A        %7D)%0A      %7D)%0A    %7D%0A%0A    %2F%2F Start Handsfree%0A    handsfree.start()%0A  %7D%0A%0A  %2F%2F Inject Handsfree.js%0A  document.head.appendChild(%24link)%0A  document.body.appendChild(%24script)%0A%7D)()%7D)()%3B
```