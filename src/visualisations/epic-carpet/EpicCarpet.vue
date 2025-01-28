<template>
  <div class="absolute-full" ref="canvasWrapper">
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from "vue";

const canvasWrapper = ref();

const props = defineProps({
  audioData: Uint8Array
})

let renderer: any;
let scene: any;
let camera: any;
let plane: any;
let material: any;

const fragmentShader1 = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}


// By iq: https://www.shadertoy.com/user/iq
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.4 + iTime*.4);

        d = sin(d*8. + iTime)/8.;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }

    fragColor = vec4(finalColor, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

let analyser,
  source,
  audioData

const uniforms = {
  iTime: {value: 0},
  iResolution: {value: new THREE.Vector3()},

};

onMounted(() => {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    -1, // left
    1, // right
    1, // top
    -1, // bottom
    -1, // near,
    1, // far
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight);
  canvasWrapper.value.appendChild(renderer.domElement);
  plane = new THREE.PlaneGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    fragmentShader: fragmentShader1,
    uniforms,
  });
  scene.add(new THREE.Mesh(plane, material));
  animate();
});

const animate = function (time: number) {
  time *= 0.001;
  uniforms.iResolution.value.set(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight, 1);
  uniforms.iTime.value = time;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
</script>
