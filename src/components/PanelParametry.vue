<template>
  <section>
    <h3>Parametry studni</h3>
    <div class="params-row">
      <div class="form-group">
        <label>Wysokość (mm)</label>
        <input type="number" v-model.number="store.wysokosc" min="500" max="3000" step="100">
      </div>
      <div class="form-group">
        <label>Dno - grubość (mm)</label>
        <input type="number" v-model.number="store.glebokosc" min="50" max="500" step="10">
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
</style>
