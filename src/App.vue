<template>
  <div class="app-wrapper">
    <div class="demo-banner">
      <span class="demo-title">DEMO KONFIGURATOR</span>
      <span class="demo-author">Wykonanie: Marcin Łotocki</span>
    </div>
    <div class="app">
      <SceneViewer @click="onSceneClick" />
      <Panel :isOpen="panelOpen" @toggle="panelOpen = !panelOpen" />
      <button class="panel-toggle" @click="panelOpen = !panelOpen" :class="{ open: panelOpen }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" v-if="!panelOpen"/>
          <path d="M9 18l6-6-6-6" v-else/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SceneViewer from './components/SceneViewer.vue'
import Panel from './components/Panel.vue'

const panelOpen = ref(true)

function onSceneClick() {
  if (window.innerWidth <= 900 && panelOpen.value) {
    panelOpen.value = false
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: manipulation;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f5f5;
  -webkit-tap-highlight-color: transparent;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.demo-banner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  z-index: 100;
  flex-shrink: 0;
}

.demo-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.demo-author {
  font-size: 12px;
  opacity: 0.9;
}

.app {
  display: flex;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.panel-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  width: 32px;
  height: 60px;
  background: #2563eb;
  border: none;
  border-radius: 8px 0 0 8px;
  color: #fff;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  transition: all 0.3s;
}

.panel-toggle:hover {
  background: #1d4ed8;
}

.panel-toggle svg {
  width: 20px;
  height: 20px;
}

.panel-toggle.open {
  right: min(380px, 85vw);
}

@media (max-width: 900px) {
  .demo-banner {
    padding: 6px 12px;
  }

  .demo-title {
    font-size: 12px;
    letter-spacing: 1px;
  }

  .demo-author {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .demo-banner {
    flex-direction: column;
    gap: 2px;
    text-align: center;
  }

  .demo-title {
    font-size: 11px;
  }

  .demo-author {
    font-size: 9px;
  }

  .panel-toggle.open {
    right: 100vw;
    transform: translateY(-50%) translateX(100%);
  }
}
</style>
