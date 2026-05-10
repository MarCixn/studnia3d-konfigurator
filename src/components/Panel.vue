<template>
  <div class="panel">
    <h2>Konfigurator Studni</h2>

    <!-- Zakładki główne -->
    <div class="main-tabs">
      <button
        :class="{ active: activeTab === 'produkcja' }"
        @click="activeTab = 'produkcja'"
      >
        Produkcja
      </button>
      <button
        :class="{ active: activeTab === 'ustawienia' }"
        @click="activeTab = 'ustawienia'"
      >
        Ustawienia
      </button>
    </div>

    <!-- Produkcja -->
    <div v-if="activeTab === 'produkcja'">
      <PanelKategoria />
      <PanelParametry />
      <PanelMufyProdukcja />
    </div>

    <!-- Ustawienia -->
    <div v-if="activeTab === 'ustawienia'">
      <PanelTypyMuf />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelKategoria from './PanelKategoria.vue'
import PanelParametry from './PanelParametry.vue'
import PanelMufyProdukcja from './PanelMufyProdukcja.vue'
import PanelTypyMuf from './PanelTypyMuf.vue'

const activeTab = ref('produkcja')
</script>

<style scoped>
.panel {
  width: 380px;
  background: #ffffff;
  color: #333;
  padding: 20px;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
}

h2 {
  color: #2563eb;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.main-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.main-tabs button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: #f9fafb;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.main-tabs button:first-child {
  border-right: 1px solid #e5e7eb;
}

.main-tabs button:hover {
  background: #f3f4f6;
}

.main-tabs button.active {
  background: #2563eb;
  color: #fff;
}
</style>
