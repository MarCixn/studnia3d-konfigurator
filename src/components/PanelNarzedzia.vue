<template>
  <section>
    <h3>Narzędzia pomiarowe</h3>

    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" v-model="store.miarkaY">
        Miarka Y (pionowa)
      </label>
    </div>

    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" v-model="store.miarkaXZ">
        Miarka X+Z (pozioma)
      </label>
    </div>

    <div class="form-group" v-if="store.miarkaXZ">
      <label>Wysokość miarki poziomej (mm)</label>
      <input type="number" v-model.number="store.miarkaXZWysokosc" min="0" max="3000" step="50">
    </div>

    <h3>Kątomierz</h3>

    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" v-model="store.katomierz">
        Włącz kątomierz
      </label>
    </div>

    <div v-if="store.katomierz">
      <div class="form-group">
        <label>Wysokość kątomierza (mm)</label>
        <input type="number" v-model.number="store.katomierzWysokosc" min="0" max="3000" step="50">
      </div>

      <div class="info-box">
        <div>Kąt: <strong>{{ store.katomierzKat }}°</strong></div>
        <small>Kliknij na scenę aby ustawić kąt</small>
      </div>
    </div>
  </section>
</template>

<script setup>
import { store } from '../stores/studniaStore'
</script>

<style scoped>
h3 {
  color: #1e40af;
  margin: 15px 0 10px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #6b7280;
}

label.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #374151;
  font-weight: 500;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
}

input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 10px;
}

.info-box strong {
  color: #0369a1;
  font-size: 16px;
}

.info-box small {
  color: #6b7280;
  display: block;
  margin-top: 5px;
}
</style>
