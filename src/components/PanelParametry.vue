<template>
  <section>
    <h3>Parametry studni</h3>
    <div class="params-row">
      <div class="form-group">
        <label>Wysokość (mm)</label>
        <input type="number" v-model.number="store.wysokosc" min="500" max="3000" step="100">
        <small class="hint">Min: {{ store.glebokosc }}mm, Max: 3000mm</small>
      </div>
      <div class="form-group">
        <label>Dno - grubość (mm)</label>
        <input type="number" v-model.number="store.glebokosc" min="50" max="500" step="10">
        <small class="hint">Min: 50mm, Max: 500mm</small>
      </div>
    </div>
  </section>
</template>

<script setup>
import { watch } from 'vue'
import { store } from '../stores/studniaStore'

// Walidacja wysokości
watch(() => store.wysokosc, (nowaWartosc) => {
  if (nowaWartosc > 3000) {
    store.wysokosc = 3000
  } else if (nowaWartosc < store.glebokosc) {
    store.wysokosc = store.glebokosc
  }
})

// Walidacja głębokości dna
watch(() => store.glebokosc, (nowaWartosc) => {
  if (nowaWartosc > 500) {
    store.glebokosc = 500
  } else if (nowaWartosc < 50) {
    store.glebokosc = 50
  }

  // Jeśli głębokość jest większa niż wysokość, dostosuj wysokość
  if (store.wysokosc < nowaWartosc) {
    store.wysokosc = nowaWartosc
  }
})
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

.params-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #6b7280;
}

input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 13px;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.hint {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: #9ca3af;
  font-style: italic;
}
</style>
