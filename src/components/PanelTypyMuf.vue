<template>
  <section>
    <h3>Preferencje</h3>

    <div class="preference-row">
      <span class="pref-label">Mufy liczone od:</span>
      <div class="toggle-container">
        <span class="toggle-label" :class="{ active: !store.mufyOdDna }">góry</span>
        <label class="toggle">
          <input type="checkbox" v-model="store.mufyOdDna">
          <span class="slider"></span>
        </label>
        <span class="toggle-label" :class="{ active: store.mufyOdDna }">dna</span>
      </div>
    </div>

    <div class="preference-row">
      <span class="pref-label">Wysokość od:</span>
      <div class="toggle-container">
        <span class="toggle-label" :class="{ active: !store.mufyOdSrodka }">śr. wewn.</span>
        <label class="toggle">
          <input type="checkbox" v-model="store.mufyOdSrodka">
          <span class="slider"></span>
        </label>
        <span class="toggle-label" :class="{ active: store.mufyOdSrodka }">środka</span>
      </div>
    </div>

    <h3>Dodaj typ mufy</h3>

    <div class="form-group">
      <label>Nazwa</label>
      <input type="text" v-model="nowaNazwa" placeholder="np. DN110">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Śr. wewn. (mm)</label>
        <input type="number" v-model.number="nowaSrWewn" min="20" max="500">
      </div>
      <div class="form-group">
        <label>Śr. zewn. (mm)</label>
        <input type="number" v-model.number="nowaSrZewn" min="25" max="600">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Kolor</label>
        <input type="color" v-model="nowyKolor" class="color-input">
      </div>
      <div class="form-group">
        <label>Margines (mm)</label>
        <input type="number" v-model.number="nowyMargines" min="0" max="100" step="5">
      </div>
    </div>
    <button class="btn-primary" @click="dodajTyp">Dodaj typ mufy</button>

    <h3>Dostępne typy muf</h3>
    <div class="typy-lista">
      <div v-for="(typ, i) in store.typyMuf" :key="i" class="typ-item">
        <div class="typ-header">
          <input type="text" v-model="typ.nazwa" class="nazwa-input">
          <button class="btn-danger" @click="usunTyp(i)">×</button>
        </div>
        <div class="typ-row">
          <div class="typ-field">
            <label>Wewn.</label>
            <input type="number" v-model.number="typ.srWewn" min="20" max="500">
          </div>
          <div class="typ-field">
            <label>Zewn.</label>
            <input type="number" v-model.number="typ.srZewn" min="25" max="600">
          </div>
        </div>
        <div class="typ-row">
          <div class="typ-field">
            <label>Kolor</label>
            <input type="color" v-model="typ.kolor" class="color-small">
          </div>
          <div class="typ-field">
            <label>Margines</label>
            <input type="number" v-model.number="typ.margines" min="0" max="100" step="5">
          </div>
        </div>
      </div>
      <div v-if="store.typyMuf.length === 0" class="empty">
        Brak typów muf. Dodaj pierwszy typ powyżej.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { store, actions } from '../stores/studniaStore'

const nowaNazwa = ref('')
const nowaSrWewn = ref(110)
const nowaSrZewn = ref(125)
const nowyKolor = ref('#ffffff')
const nowyMargines = ref(20)

function dodajTyp() {
  if (!nowaNazwa.value) {
    alert('Podaj nazwę mufy!')
    return
  }
  if (!actions.dodajTypMufy(nowaNazwa.value, nowaSrWewn.value, nowaSrZewn.value, nowyKolor.value, nowyMargines.value)) {
    alert('Nazwa już istnieje lub średnice są nieprawidłowe!')
    return
  }
  nowaNazwa.value = ''
}

function usunTyp(index) {
  if (!actions.usunTypMufy(index)) {
    alert('Nie można usunąć - mufa jest używana na modelu!')
  }
}
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

h3:first-child {
  margin-top: 0;
}

.form-group {
  margin-bottom: 10px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 4px;
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

.color-input {
  width: 100%;
  height: 36px;
  padding: 2px;
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  padding: 10px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
  padding: 2px 8px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-danger:hover {
  background: #dc2626;
}

.typy-lista {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.typ-item {
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border: 1px solid #d1d5db;
  padding: 10px;
  border-radius: 8px;
}

.typ-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.nazwa-input {
  flex: 1;
  font-weight: 600;
  color: #1e40af;
}

.typ-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.typ-row:last-child {
  margin-bottom: 0;
}

.typ-field {
  flex: 1;
}

.typ-field label {
  font-size: 10px;
  margin-bottom: 2px;
  color: #6b7280;
}

.typ-field input {
  padding: 4px 6px;
  font-size: 12px;
}

.color-small {
  height: 28px;
  padding: 1px;
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 20px;
}

.preference-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 10px;
}

.pref-label {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-label {
  font-size: 11px;
  color: #9ca3af;
  transition: color 0.2s;
}

.toggle-label.active {
  color: #2563eb;
  font-weight: 600;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle input:checked + .slider {
  background-color: #2563eb;
}

.toggle input:checked + .slider:before {
  transform: translateX(18px);
}
</style>
