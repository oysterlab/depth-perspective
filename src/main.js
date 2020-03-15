import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
camera.position.z = 10
const scene = new THREE.Scene()

const geometry = new THREE.PlaneGeometry(2 * 640 / 480, 2)
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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

      float t = 0.08;

      if (depth > 0.2) {
        t = 0.12;
      } else if (depth > 0.1) {
        t = 0.1;
      }

      uv += (depth * d * d * t);
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
mesh.position.z = 1
scene.add(mesh)

const rgbPath = 'assets/g0U95UErodo/rgb/'
const depthPath = 'assets/g0U95UErodo/depth/'

const FRAME_START = parseInt(Math.random() * 10000)
const FRAME_COUNT = 15000
let frameCount = 0

function pad(str, padString, length) {
  while (str.length < length)
      str = padString + str;
  return str;
}8000
new THREE.TextureLoader().load(depthPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
  mesh.material.uniforms.depthTexture.value = t
})

const controls = new OrbitControls(camera, renderer.domElement)

const render = () => { 
  renderer.render(scene, camera)
  controls.update()

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