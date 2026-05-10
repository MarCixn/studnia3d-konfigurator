<template>
  <div class="panel" :class="{ open: isOpen }">
    <div class="panel-content">
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

    <!-- PDF Export - zawsze na dole -->
    <div class="panel-footer">
      <div class="form-group">
        <label>Nazwa klienta / firmy</label>
        <input type="text" v-model="nazwaKlienta" placeholder="np. Firma XYZ Sp. z o.o.">
      </div>
      <button class="btn-pdf" @click="eksportujPdf">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="12" y2="18"/>
          <line x1="15" y1="15" x2="12" y2="18"/>
        </svg>
        Generuj kartę technologiczną (PDF)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelKategoria from './PanelKategoria.vue'
import PanelParametry from './PanelParametry.vue'
import PanelMufyProdukcja from './PanelMufyProdukcja.vue'
import PanelTypyMuf from './PanelTypyMuf.vue'
import { usePdfExport } from '../composables/usePdfExport'

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits(['toggle'])

const activeTab = ref('produkcja')
const nazwaKlienta = ref('')
const { generujPdf } = usePdfExport()

function eksportujPdf() {
  generujPdf(nazwaKlienta.value)
}
</script>

<style scoped>
.panel {
  width: 380px;
  max-width: 85vw;
  background: #ffffff;
  color: #333;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 40;
  transform: translateX(100%);
  display: flex;
  flex-direction: column;
}

.panel.open {
  transform: translateX(0);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 10px;
}

.panel-footer {
  padding: 15px 20px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.panel-footer .form-group {
  margin-bottom: 10px;
}

.panel-footer .form-group label {
  display: block;
  font-size: 11px;
  color: #374151;
  margin-bottom: 4px;
  font-weight: 500;
}

.panel-footer .form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
}

.panel-footer .form-group input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.btn-pdf {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(to bottom, #059669, #047857);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
  transition: all 0.2s;
}

.btn-pdf:hover {
  background: linear-gradient(to bottom, #047857, #065f46);
  box-shadow: 0 4px 8px rgba(5, 150, 105, 0.4);
  transform: translateY(-1px);
}

.btn-pdf svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 480px) {
  .panel {
    width: 100vw;
    max-width: 100vw;
  }

  .panel-content {
    padding: 15px;
    padding-top: 55px;
  }

  .panel-footer {
    padding: 12px 15px;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .main-tabs button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .btn-pdf {
    font-size: 11px;
    padding: 10px 12px;
  }
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
