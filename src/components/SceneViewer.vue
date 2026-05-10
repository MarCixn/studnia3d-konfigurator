<template>
  <div class="scene-container" ref="containerRef" @touchstart="$emit('click')" @mousedown="$emit('click')">
    <!-- Toolbar z narzędziami pomiarowymi -->
    <div class="toolbar">
      <button
        class="tool-btn"
        :class="{ active: store.aktywneNarzedzie === 'odleglosc3d' }"
        @click="toggleNarzedzie('odleglosc3d')"
        title="Pomiar 3D punkt-punkt"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="20" x2="20" y2="4"/>
          <circle cx="4" cy="20" r="2"/>
          <circle cx="20" cy="4" r="2"/>
        </svg>
      </button>
      <button
        class="tool-btn"
        :class="{ active: store.aktywneNarzedzie === 'wysokosc' }"
        @click="toggleNarzedzie('wysokosc')"
        title="Pomiar wysokości (point-to-point)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="3" x2="12" y2="21"/>
          <polyline points="8,7 12,3 16,7"/>
          <polyline points="8,17 12,21 16,17"/>
        </svg>
      </button>
      <button
        class="tool-btn"
        :class="{ active: store.aktywneNarzedzie === 'odleglosc' }"
        @click="toggleNarzedzie('odleglosc')"
        title="Pomiar odległości X+Z (point-to-point)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <polyline points="7,8 3,12 7,16"/>
          <polyline points="17,8 21,12 17,16"/>
        </svg>
      </button>
      <button
        class="tool-btn"
        :class="{ active: store.aktywneNarzedzie === 'kat' }"
        @click="toggleNarzedzie('kat')"
        title="Pomiar kąta (point-to-point)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 12 L20 12 A8 8 0 0 0 16 6 L12 12"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      </button>
      <button
        class="tool-btn"
        @click="centerCamera"
        title="Wyśrodkuj kamerę"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </button>
    </div>

    <!-- Panel wyniku pomiaru -->
    <div class="pomiar-panel" v-if="store.aktywneNarzedzie">
      <div class="pomiar-header">
        <span v-if="store.aktywneNarzedzie === 'odleglosc3d'">Pomiar 3D</span>
        <span v-else-if="store.aktywneNarzedzie === 'wysokosc'">Pomiar wysokości</span>
        <span v-else-if="store.aktywneNarzedzie === 'odleglosc'">Pomiar odległości</span>
        <span v-else-if="store.aktywneNarzedzie === 'kat'">Pomiar kąta</span>
        <button class="close-btn" @click="store.aktywneNarzedzie = null">×</button>
      </div>
      <div class="pomiar-body">
        <div v-if="store.pomiarPunkty.length === 0">
          Kliknij pierwszy punkt
        </div>
        <div v-else-if="store.pomiarPunkty.length === 1">
          Kliknij drugi punkt
        </div>
        <div v-else class="wynik">
          <strong>{{ store.pomiarWynik }}</strong>
          <button class="reset-btn" @click="resetPomiar">Nowy pomiar</button>
        </div>
      </div>
    </div>

    <!-- Ostrzeżenie o kolizji -->
    <div class="kolizja-warning" v-if="store.kolizje.length > 0">
      <span class="kolizja-icon">!</span>
      <span>Kolizja muf: {{ kolizjeText }}</span>
    </div>

    <!-- Debug mode indicator -->
    <div class="debug-badge" v-if="store.debugMode">
      DEBUG MODE (Ctrl+Shift+D)
    </div>

    <div class="info">
      Obracanie: LPM | Przesuwanie: środkowy | Zoom: PPM lub scroll
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThreeScene } from '../composables/useThreeScene'
import { store, actions } from '../stores/studniaStore'

defineEmits(['click'])

const containerRef = ref(null)
const { init, dispose, centerCamera } = useThreeScene(containerRef)

const kolizjeText = computed(() => {
  return store.kolizje.map(([i, j]) => `#${i + 1} - #${j + 1}`).join(', ')
})

function toggleNarzedzie(nazwa) {
  if (store.aktywneNarzedzie === nazwa) {
    store.aktywneNarzedzie = null
  } else {
    store.aktywneNarzedzie = nazwa
  }
}

function resetPomiar() {
  store.pomiarPunkty = []
  store.pomiarWynik = null
  // Trigger watch w useThreeScene
  const current = store.aktywneNarzedzie
  store.aktywneNarzedzie = null
  setTimeout(() => store.aktywneNarzedzie = current, 0)
}

function onKeyDown(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    store.debugMode = !store.debugMode
  }
}

onMounted(() => {
  init()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  dispose()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.scene-container {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 0;
}

.toolbar {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.tool-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.tool-btn.active {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

.tool-btn svg {
  width: 22px;
  height: 22px;
}

.pomiar-panel {
  position: absolute;
  top: 70px;
  left: 15px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  min-width: 180px;
  z-index: 10;
  overflow: hidden;
}

.pomiar-header {
  background: #f59e0b;
  color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.pomiar-body {
  padding: 12px;
  font-size: 13px;
  color: #374151;
}

.wynik {
  text-align: center;
}

.wynik strong {
  display: block;
  font-size: 24px;
  color: #f59e0b;
  margin-bottom: 10px;
}

.reset-btn {
  background: #e5e7eb;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #d1d5db;
}

.info {
  position: absolute;
  bottom: 15px;
  left: 15px;
  color: #374151;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 14px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}

.kolizja-warning {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
  z-index: 20;
  animation: pulse 1.5s infinite;
}

.kolizja-icon {
  background: #fff;
  color: #ef4444;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.debug-badge {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: #8b5cf6;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

@media (max-width: 600px) {
  .toolbar {
    top: 10px;
    left: 10px;
    gap: 5px;
  }

  .tool-btn {
    width: 36px;
    height: 36px;
  }

  .tool-btn svg {
    width: 18px;
    height: 18px;
  }

  .pomiar-panel {
    top: 55px;
    left: 10px;
    min-width: 150px;
    font-size: 12px;
  }

  .info {
    bottom: 10px;
    left: 10px;
    font-size: 10px;
    padding: 6px 10px;
  }

  .kolizja-warning {
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    font-size: 13px;
    gap: 8px;
  }

  .kolizja-icon {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }

  .debug-badge {
    bottom: 10px;
    right: 10px;
    padding: 5px 10px;
    font-size: 10px;
  }
}

@media (max-width: 400px) {
  .info {
    display: none;
  }
}
</style>
