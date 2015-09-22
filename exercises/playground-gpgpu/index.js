var matchFBO     = require('../../lib/match-fbo')
var mouse        = require('mouse-position')()
var mouseDown    = require('mouse-pressed')(null, true)
var triangle     = require('a-big-triangle')
var throttle     = require('frame-debounce')
var fit          = require('canvas-fit')
var getContext   = require('gl-context')
var compare      = require('gl-compare')
var ndarray      = require('ndarray')
var createShader = require('glslify')
var createFBO    = require('gl-fbo')
var fs           = require('fs')
var now          = require('right-now')

var container  = document.getElementById('container')
var canvas     = container.appendChild(document.createElement('canvas'))
var readme     = fs.readFileSync(__dirname + '/README.md', 'utf8')
var gl         = getContext(canvas, tick)
var comparison = compare(gl, render, render)
var tickCount  = 0
var numBuffers = 3

window.addEventListener('resize', fit(canvas), false)
var renderShader = createShader({
    frag: process.env.file_render_glsl
  , vert: './shaders/pass-thru.glsl'
})(gl)

var updateShader = createShader({
    frag: process.env.file_update_glsl
  , vert: './shaders/pass-thru.glsl'
})(gl)

var buffers = new Array(numBuffers)
for(var i=0; i<numBuffers; ++i) {
  buffers[i] = createFBO(gl, [512,512], {float: true})
}

var t, r, g, b, r2, g2, b2

function render() {
  r,g,b = 0,0,0
  colorStep = tickCount % (255*6)
  if (colorStep < 255) {
    r = 255
    g = colorStep
  } else if (colorStep < 255*2) {
    r = 255-(colorStep-255)
    g = 255
  } else if (colorStep < 255*3) {
    g = 255
    b = colorStep-255*2
  } else if (colorStep < 255*4) {
    g = 255-(colorStep-255*3)
    b = 255
  } else if (colorStep < 255*5) {
    b = 255
    r = colorStep-255*4
  } else {
    b = 255-(colorStep-255*5)
    r = 255
  }

  r2,g2,b2 = 0,0,0
  colorStep = (tickCount-300) % (255*6)
  if (colorStep < 255) {
    r2 = 255
    g2 = colorStep
  } else if (colorStep < 255*2) {
    r2 = 255-(colorStep-255)
    g2 = 255
  } else if (colorStep < 255*3) {
    g2 = 255
    b2 = colorStep-255*2
  } else if (colorStep < 255*4) {
    g2 = 255-(colorStep-255*3)
    b2 = 255
  } else if (colorStep < 255*5) {
    b2 = 255
    r2 = colorStep-255*4
  } else {
    b2 = 255-(colorStep-255*5)
    r2 = 255
  }

  var nshape = [canvas.height, canvas.width]
  var mousePos = [ mouse.x, canvas.height-mouse.y-1 ]
  var mouseState = [ mouseDown.left, mouseDown.middle, mouseDown.right ]
  var front   = buffers[tickCount%buffers.length]
  var back0   = buffers[(tickCount+buffers.length-1)%buffers.length]
  var back1   = buffers[(tickCount+buffers.length-2)%buffers.length]

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, canvas.width, canvas.height)
  renderShader.bind()
  renderShader.uniforms.state = [ front.color[0].bind(0), back0.color[0].bind(1), back1.color[0].bind(2) ]
  renderShader.uniforms.screenSize = [ canvas.width, canvas.height ]
  renderShader.uniforms.mousePosition = mousePos
  renderShader.uniforms.mouseDown = mouseState
  renderShader.uniforms.time = t
  renderShader.uniforms.rainbowColor1 = [r/225.0,g/225.0,b/225.0] 
  renderShader.uniforms.rainbowColor2 = [r2/225.0,g2/225.0,b2/225.0] 

  triangle(gl)

}

function update() {
  t = now()

  tickCount = tickCount + 1
  var nshape = [canvas.height, canvas.width]
  for(var i=0; i<numBuffers; ++i) {
    buffers[i].shape = nshape
  }

  var front   = buffers[tickCount%buffers.length]
  var back0   = buffers[(tickCount+buffers.length-1)%buffers.length]
  var back1   = buffers[(tickCount+buffers.length-2)%buffers.length]

  var mousePos   = [ mouse.x, canvas.height-mouse.y-1 ]
  var mouseState = [ mouseDown.left, mouseDown.middle, mouseDown.right ]

  //Apply update
  front.bind()

  //Apply transformation
  updateShader.bind()
  updateShader.uniforms.state = [ back0.color[0].bind(0), back1.color[0].bind(1) ]
  updateShader.uniforms.screenSize = [ canvas.width, canvas.height ]
  updateShader.uniforms.mousePosition = mousePos
  updateShader.uniforms.mouseDown = mouseState
  updateShader.uniforms.time = t
  triangle(gl)
}

function tick() {
  update()
  render()
}