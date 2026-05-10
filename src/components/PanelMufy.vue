<template>
  <section>
    <h3>Mufy</h3>

    <!-- Zakładki -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'dodaj' }" @click="activeTab = 'dodaj'">
        Dodaj mufę
      </button>
      <button :class="{ active: activeTab === 'typy' }" @click="activeTab = 'typy'">
        Typy muf
      </button>
    </div>

    <!-- Zakładka: Dodaj mufę -->
    <div v-if="activeTab === 'dodaj'" class="tab-content">
      <div class="form-group">
        <label>Rodzaj mufy</label>
        <select v-model="nowaRodzaj">
          <option value="">-- wybierz --</option>
          <option v-for="typ in store.typyMuf" :key="typ.nazwa" :value="typ.nazwa">
            {{ typ.nazwa }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Kąt (stopnie)</label>
        <input type="number" v-model.number="nowaKat" min="0" max="360" step="15">
      </div>
      <div class="form-group">
        <label>Wysokość od dna (mm)</label>
        <input type="number" v-model.number="nowaWysokosc" min="0" max="3000" step="50">
      </div>
      <button class="btn-primary" @click="dodajMufe">Dodaj mufę na model</button>
      <p class="counter">Dodano: {{ store.mufyNaModelu.length }}/20</p>

      <!-- Lista dodanych muf -->
      <div class="mufy-lista">
        <div v-for="(mufa, i) in store.mufyNaModelu" :key="i" class="mufa-item">
          <span>{{ mufa.rodzaj }} | {{ mufa.kat }}° | wys: {{ mufa.wysokoscOdDna }}mm</span>
          <button class="btn-danger" @click="actions.usunMufe(i)">X</button>
        </div>
      </div>
    </div>

    <!-- Zakładka: Typy muf -->
    <div v-if="activeTab === 'typy'" class="tab-content">
      <p class="hint">Dodaj nowy typ mufy:</p>
      <div class="form-group">
        <label>Nazwa</label>
        <input type="text" v-model="nowaNazwa" placeholder="np. DN110">
      </div>
      <div class="form-group">
        <label>Średnica wewnętrzna (mm)</label>
        <input type="number" v-model.number="nowaSrWewn" min="20" max="500">
      </div>
      <div class="form-group">
        <label>Średnica zewnętrzna (mm)</label>
        <input type="number" v-model.number="nowaSrZewn" min="25" max="600">
      </div>
      <button class="btn-primary" @click="dodajTyp">Dodaj typ mufy</button>

      <h4>Dostępne typy muf</h4>
      <div class="typy-lista">
        <div v-for="(typ, i) in store.typyMuf" :key="typ.nazwa" class="typ-item">
          <span>{{ typ.nazwa }} (wewn: {{ typ.srWewn }}mm, zewn: {{ typ.srZewn }}mm)</span>
          <button class="btn-danger" @click="usunTyp(i)">Usuń</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { store, actions } from '../stores/studniaStore'

const activeTab = ref('dodaj')

// Formularz dodawania mufy
const nowaRodzaj = ref('')
const nowaKat = ref(0)
const nowaWysokosc = ref(300)

// Formularz typu mufy
const nowaNazwa = ref('')
const nowaSrWewn = ref(110)
const nowaSrZewn = ref(125)

function dodajMufe() {
  if (!nowaRodzaj.value) {
    alert('Wybierz rodzaj mufy!')
    return
  }
  if (nowaWysokosc.value > store.wysokosc) {
    alert('Wysokość mufy nie może przekraczać wysokości studni!')
    return
  }
  if (!actions.dodajMufe(nowaRodzaj.value, nowaKat.value, nowaWysokosc.value)) {
    alert('Maksymalnie 20 muf na modelu!')
  }
}

function dodajTyp() {
  if (!nowaNazwa.value) {
    alert('Podaj nazwę mufy!')
    return
  }
  if (!actions.dodajTypMufy(nowaNazwa.value, nowaSrWewn.value, nowaSrZewn.value)) {
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

h4 {
  color: #1e40af;
  margin: 15px 0 10px;
  font-size: 12px;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #e5e7eb;
}

.tabs button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
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

select, input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
}

select:focus, input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.btn-primary {
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
  padding: 5px 10px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

.counter {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.mufy-lista, .typy-lista {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
}

.mufa-item, .typ-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.mufa-item span, .typ-item span {
  flex: 1;
  color: #374151;
}
</style>
