import * as THREE from 'three'

document.body.style.margin = '0px'
document.body.style.padding = '0px'
document.body.style.cursor = 'none'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(WIDTH, HEIGHT)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.001, 1000)
const scene = new THREE.Scene()

const geometry = new THREE.PlaneGeometry(2, 2)
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;      
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D rgbTexture;
    uniform sampler2D depthTexture;
    uniform vec2 d;    

    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      
      vec4 depthColor = texture2D(depthTexture, vUv);
      float depth = depthColor.r;
      uv += (depth * d * d * 0.1);
      vec4 rgbColor = texture2D(rgbTexture, uv);

      gl_FragColor = rgbColor;
    }
  `,
  uniforms: {
    rgbTexture: {type: 't', value: null},
    depthTexture: {type: 't', value: null},
    d: {type: 'v2', value: new THREE.Vector2(0, 0)}
  }
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const rgbPath = 'assets/hTNsniG5xEA/rgb/'
const depthPath = 'assets/hTNsniG5xEA/depth/'

const FRAME_START = parseInt(Math.random() * 2500)
const FRAME_COUNT = 2500
let frameCount = 0

function pad(str, padString, length) {
  while (str.length < length)
      str = padString + str;
  return str;
}8000
new THREE.TextureLoader().load(depthPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
  mesh.material.uniforms.depthTexture.value = t
})


const render = () => { 
  renderer.render(scene, camera)

  new THREE.TextureLoader().load(rgbPath+(pad((FRAME_START + frameCount) + '', '0', 5) + '.jpg'), (t) => {
    mesh.material.uniforms.rgbTexture.value = t
    requestAnimationFrame(render)
  })

  new THREE.TextureLoader().load(depthPath+(pad((FRAME_START + frameCount) + '', '0', 5) + '.jpg'), (t) => {
    mesh.material.uniforms.depthTexture.value = t
  })

  frameCount++
  frameCount %= (FRAME_COUNT - FRAME_START)  
}
requestAnimationFrame(render)

window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / WIDTH)
  const y = (e.clientY / HEIGHT)

  mesh.material.uniforms.d.value = [x, y]

})