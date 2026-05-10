<template>
  <div class="app-wrapper">
    <div class="demo-banner">
      <span class="demo-title">DEMO KONFIGURATOR</span>
      <span class="demo-author">Wykonanie: Marcin Łotocki</span>
    </div>
    <div class="app">
      <SceneViewer />
      <Panel />
    </div>
  </div>
</template>

<script setup>
import SceneViewer from './components/SceneViewer.vue'
import Panel from './components/Panel.vue'
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
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f5f5;
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
}
</style>
