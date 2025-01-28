<template>
  <div class="absolute-full" ref="canvasWrapper">
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import {
  Audio,
  AudioAnalyser,
  AudioListener,
  AudioLoader,
  Clock,
  Color,
  PerspectiveCamera,
  SphereGeometry,
  Vector3
} from 'three';
import {onMounted, ref} from "vue";
import {createSculptureWithGeometry} from 'shader-park-core';
import {spCode} from './sp-code.js';

const canvasWrapper = ref();

const props = defineProps({
  audioData: Uint8Array
})

let renderer: any;
let scene: any;
let camera: any;

let analyser,
  source,
  audioData

onMounted(() => {
  scene = new THREE.Scene();
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 1.5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new Color(1, 1, 1), 0);

  let clock = new Clock();

  const listener = new AudioListener();
  camera.add(listener);
  const sound = new Audio(listener);

  canvasWrapper.value.appendChild(renderer.domElement);

  const audioLoader = new AudioLoader();
  audioLoader.load('https://cdn.glitch.global/59b80ec2-4e5b-4b54-b910-f3441cac0fd6/OP1Beat.wav?v=1667175863547', function (buffer: any) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  });

  const analyser = new AudioAnalyser(sound, 32);

  let state = {
    mouse: new Vector3(),
    currMouse: new Vector3(),
    pointerDown: 0.0,
    currPointerDown: 0.0,
    audio: 0.0,
    currAudio: 0.0,
    time: 0.0
  }

  let geometry = new SphereGeometry(2, 45, 45);

  let mesh = createSculptureWithGeometry(geometry, spCode(), () => ({
    time: state.time,
    pointerDown: state.pointerDown,
    audio: state.audio,
    mouse: state.mouse,
    _scale: .5
  }));

  scene.add(mesh);

  const animate = function (time: number) {
    state.time += clock.getDelta();
    if (analyser) {
      state.currAudio += Math.pow((analyser.getFrequencyData()[2] / 255) * .81, 8) + clock.getDelta() * .5;
      state.audio = .2 * state.currAudio + .8 * state.audio;
    }
    state.pointerDown = .1 * state.currPointerDown + .9 * state.pointerDown;
    state.mouse.lerp(state.currMouse, .05);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
});


</script>
