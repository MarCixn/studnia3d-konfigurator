<template>
  <section>
    <h3>Kategoria</h3>
    <div class="form-group">
      <select v-model.number="store.kategoria">
        <option :value="1000">Krąg 1000mm</option>
        <option :value="1200">Krąg 1200mm</option>
      </select>
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

select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
</style>
