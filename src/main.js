import * as THREE from 'three'

document.body.style.margin = '0px'
document.body.style.padding = '0px'

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
      uv += (depthColor.r * d.xy * 0.03);
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

const rgbPath = 'assets/g0U95UErodo/rgb/'
const depthPath = 'assets/g0U95UErodo/depth/'

let frameCount = 0
const FRAME_COUNT = 15000
function pad(str, padString, length) {
  while (str.length < length)
      str = padString + str;
  return str;
}

new THREE.TextureLoader().load(rgbPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
  mesh.material.uniforms.rgbTexture.value = t
})

new THREE.TextureLoader().load(depthPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
  mesh.material.uniforms.depthTexture.value = t
})


setInterval(() => {
  new THREE.TextureLoader().load(rgbPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
    mesh.material.uniforms.rgbTexture.value = t
  })

  new THREE.TextureLoader().load(depthPath+(pad(frameCount + '', '0', 5) + '.jpg'), (t) => {
    mesh.material.uniforms.depthTexture.value = t
  })

  frameCount++
  frameCount %= FRAME_COUNT
}, 1000 / 60)

const render = () => { 
  renderer.render(scene, camera)

  
  requestAnimationFrame(render)
}
requestAnimationFrame(render)

window.addEventListener('mousemove', (e) => {
  const x = e.clientX / WIDTH
  const y = e.clientY / HEIGHT

  mesh.material.uniforms.d.value = [x, y]

})