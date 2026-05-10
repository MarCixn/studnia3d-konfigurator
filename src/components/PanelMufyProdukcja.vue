<template>
  <section>
    <h3>Mufy ({{ store.mufyNaModelu.length }}/20)</h3>

    <!-- Lista edytowalnych muf -->
    <div class="mufy-lista">
      <div v-for="(mufa, i) in store.mufyNaModelu" :key="i" class="mufa-kontener">
        <div class="mufa-header">
          <span class="mufa-nr">#{{ i + 1 }}</span>
          <button class="btn-usun" @click="actions.usunMufe(i)">×</button>
        </div>
        <div class="mufa-row">
          <div class="mufa-field">
            <label>Rodzaj</label>
            <select :value="mufa.rodzaj" @change="zmienRodzaj(i, $event.target.value)">
              <option v-for="typ in store.typyMuf" :key="typ.nazwa" :value="typ.nazwa">
                {{ typ.nazwa }}
              </option>
            </select>
          </div>
          <div class="mufa-field">
            <label>Kąt</label>
            <input type="number" :value="mufa.kat" @input="zmienKat(i, $event.target.value)" step="1">
          </div>
          <div class="mufa-field">
            <label>Wys.</label>
            <input type="number" :value="getWysokoscDisplay(mufa)" @change="zmienWysokosc(i, $event.target.value)" min="-1000" max="3000" step="10">
          </div>
        </div>
      </div>
    </div>

    <button class="btn-dodaj" @click="dodajMufe" :disabled="store.mufyNaModelu.length >= 20">
      + Dodaj mufę
    </button>

    <!-- Export PDF -->
    <div class="pdf-section">
      <h3>Eksport PDF</h3>
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
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { store, actions } from '../stores/studniaStore'
import { usePdfExport } from '../composables/usePdfExport'

const nazwaKlienta = ref('')
const { generujPdf } = usePdfExport()

function eksportujPdf() {
  generujPdf(nazwaKlienta.value)
}

function getWysokoscDisplay(mufa) {
  const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)
  const promienWewn = typ ? typ.srWewn / 2 : 0

  let wyswietlana

  if (store.mufyOdDna) {
    if (store.mufyOdSrodka) {
      wyswietlana = mufa.wysokoscOdDna
    } else {
      wyswietlana = mufa.wysokoscOdDna - store.glebokosc - promienWewn
    }
  } else {
    if (store.mufyOdSrodka) {
      wyswietlana = store.wysokosc - mufa.wysokoscOdDna
    } else {
      wyswietlana = store.wysokosc - promienWewn - mufa.wysokoscOdDna
    }
  }

  return Math.round(wyswietlana)
}

function przeliczWysokoscNaStore(rodzaj, wysokoscInput) {
  const typ = store.typyMuf.find(t => t.nazwa === rodzaj)
  const promienWewn = typ ? typ.srWewn / 2 : 0
  let wysokoscOdDna

  if (store.mufyOdDna) {
    if (store.mufyOdSrodka) {
      wysokoscOdDna = wysokoscInput
    } else {
      wysokoscOdDna = store.glebokosc + promienWewn + wysokoscInput
    }
  } else {
    if (store.mufyOdSrodka) {
      wysokoscOdDna = store.wysokosc - wysokoscInput
    } else {
      wysokoscOdDna = store.wysokosc - promienWewn - wysokoscInput
    }
  }

  return wysokoscOdDna
}

function dodajMufe() {
  const wysokoscOdDna = przeliczWysokoscNaStore('DN200', 0)
  actions.dodajMufe('DN200', 0, wysokoscOdDna)
}

function zmienRodzaj(index, nowyRodzaj) {
  store.mufyNaModelu[index].rodzaj = nowyRodzaj
}

function zmienKat(index, nowyKat) {
  let kat = Number(nowyKat)
  if (kat < 0) kat = 360 + (kat % 360)
  if (kat >= 360) kat = kat % 360
  store.mufyNaModelu[index].kat = kat
}

function zmienWysokosc(index, nowaWysokosc) {
  const mufa = store.mufyNaModelu[index]
  mufa.wysokoscOdDna = przeliczWysokoscNaStore(mufa.rodzaj, Number(nowaWysokosc))
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

.mufy-lista {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mufa-kontener {
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.mufa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.mufa-nr {
  font-size: 12px;
  font-weight: 700;
  color: #1e40af;
  background: #dbeafe;
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-usun {
  background: #ef4444;
  color: #fff;
  padding: 0 6px;
  font-size: 14px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  line-height: 1.2;
}

.btn-usun:hover {
  background: #dc2626;
}

.mufa-row {
  display: flex;
  gap: 6px;
}

.mufa-field {
  flex: 1;
  min-width: 0;
}

.mufa-field label {
  display: block;
  font-size: 10px;
  color: #374151;
  margin-bottom: 2px;
  font-weight: 500;
}

.mufa-field select,
.mufa-field input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  color: #333;
}

.mufa-field select:focus,
.mufa-field input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-dodaj {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.btn-dodaj:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-dodaj:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.pdf-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #e5e7eb;
}

.pdf-section h3 {
  color: #059669;
  margin-top: 0;
}

.pdf-section .form-group {
  margin-bottom: 10px;
}

.pdf-section .form-group label {
  display: block;
  font-size: 11px;
  color: #374151;
  margin-bottom: 4px;
  font-weight: 500;
}

.pdf-section .form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
}

.pdf-section .form-group input:focus {
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
</style>
