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

    <div class="preference-row">
      <span class="pref-label">Margines kolizyjny (mm):</span>
      <input type="number" v-model.number="store.marginesKolizyjny" min="0" max="200" step="5" class="margines-input">
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
    <div class="form-group">
      <label>Kolor</label>
      <input type="color" v-model="nowyKolor" class="color-input">
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
        </div>
      </div>
      <div v-if="store.typyMuf.length === 0" class="empty">
        Brak typów muf. Dodaj pierwszy typ powyżej.
      </div>
    </div>

    <button class="btn-reset" @click="resetujTypy">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
      Resetuj typy muf do domyślnych
    </button>

    <h3 style="margin-top: 25px; color: #dc2626;">Ustawienia fabryczne</h3>

    <button class="btn-factory-reset" @click="resetujFabryczne">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      Przywróć wszystkie ustawienia fabryczne
    </button>
    <p class="factory-info">
      Przywraca domyślne: typy muf, preferencje, parametry studni i usuwa wszystkie mufy z modelu.
    </p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { store, actions } from '../stores/studniaStore'

const nowaNazwa = ref('')
const nowaSrWewn = ref(110)
const nowaSrZewn = ref(125)
const nowyKolor = ref('#ffffff')

function dodajTyp() {
  if (!nowaNazwa.value) {
    alert('Podaj nazwę mufy!')
    return
  }
  if (!actions.dodajTypMufy(nowaNazwa.value, nowaSrWewn.value, nowaSrZewn.value, nowyKolor.value)) {
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

function resetujTypy() {
  if (confirm('Czy na pewno chcesz przywrócić domyślne typy muf? Wszystkie dodane typy zostaną usunięte.')) {
    // Sprawdź czy jakieś mufy z własnych typów są na modelu
    const domyslneTypy = ['DN110', 'DN160', 'DN200']
    const maWlasne = store.mufyNaModelu.some(m => !domyslneTypy.includes(m.rodzaj))

    if (maWlasne) {
      alert('Nie można zresetować - niektóre mufy na modelu używają niestandardowych typów. Usuń je najpierw.')
      return
    }

    // Resetuj do domyślnych
    store.typyMuf.splice(0, store.typyMuf.length,
      { nazwa: 'DN110', srWewn: 110, srZewn: 125, kolor: '#ffffff' },
      { nazwa: 'DN160', srWewn: 160, srZewn: 180, kolor: '#ffffff' },
      { nazwa: 'DN200', srWewn: 200, srZewn: 225, kolor: '#e94560' }
    )

    // Wyczyść localStorage
    localStorage.removeItem('typyMuf')

    alert('Typy muf zostały przywrócone do wartości domyślnych.')
  }
}

function resetujFabryczne() {
  const potwierdzenie = confirm(
    '⚠️ UWAGA ⚠️\n\n' +
    'Czy na pewno chcesz przywrócić WSZYSTKIE ustawienia fabryczne?\n\n' +
    'Ta operacja:\n' +
    '• Przywróci domyślne typy muf (DN110, DN160, DN200)\n' +
    '• Zresetuje wszystkie preferencje\n' +
    '• Przywróci domyślne parametry studni\n' +
    '• Usunie WSZYSTKIE mufy z modelu\n' +
    '• Wyczyści zapisane dane w przeglądarce\n\n' +
    'Tej operacji NIE MOŻNA cofnąć!'
  )

  if (!potwierdzenie) return

  // Podwójne potwierdzenie dla bezpieczeństwa
  const ostateczne = confirm('Ostatnie potwierdzenie - czy NA PEWNO chcesz kontynuować?')
  if (!ostateczne) return

  try {
    // 1. Resetuj typy muf do domyślnych
    store.typyMuf.splice(0, store.typyMuf.length,
      { nazwa: 'DN110', srWewn: 110, srZewn: 125, kolor: '#ffffff' },
      { nazwa: 'DN160', srWewn: 160, srZewn: 180, kolor: '#ffffff' },
      { nazwa: 'DN200', srWewn: 200, srZewn: 225, kolor: '#e94560' }
    )

    // 2. Usuń wszystkie mufy z modelu
    store.mufyNaModelu.splice(0, store.mufyNaModelu.length)

    // 3. Resetuj parametry studni
    store.kategoria = 1000
    store.wysokosc = 800
    store.glebokosc = 200

    // 4. Resetuj preferencje
    store.mufyOdDna = true
    store.mufyOdSrodka = false
    store.marginesKolizyjny = 20
    store.debugMode = false

    // 5. Resetuj narzędzia pomiarowe
    store.aktywneNarzedzie = null
    store.pomiarPunkty = []
    store.pomiarWynik = null

    // 6. Wyczyść localStorage
    localStorage.clear()

    // 7. Wyczyść cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    alert('✅ Wszystkie ustawienia zostały przywrócone do wartości fabrycznych.\n\nStrona zostanie odświeżona.')

    // Odśwież stronę aby załadować czyste ustawienia
    setTimeout(() => {
      window.location.reload()
    }, 500)

  } catch (error) {
    alert('❌ Wystąpił błąd podczas resetowania ustawień: ' + error.message)
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

.btn-reset {
  width: 100%;
  padding: 10px 16px;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-reset:hover {
  background: #d97706;
}

.btn-reset svg {
  width: 16px;
  height: 16px;
}

.btn-factory-reset {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(to bottom, #dc2626, #b91c1c);
  color: #fff;
  border: 2px solid #991b1b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.btn-factory-reset:hover {
  background: linear-gradient(to bottom, #b91c1c, #991b1b);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.4);
}

.btn-factory-reset:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.3);
}

.btn-factory-reset svg {
  width: 18px;
  height: 18px;
}

.factory-info {
  font-size: 11px;
  color: #6b7280;
  margin-top: 8px;
  line-height: 1.4;
  padding: 8px;
  background: #fef2f2;
  border-left: 3px solid #dc2626;
  border-radius: 4px;
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

.margines-input {
  width: 80px;
  padding: 6px 8px;
  text-align: center;
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

@media (max-width: 480px) {
  .preference-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .toggle-container {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .typ-row {
    flex-direction: column;
    gap: 6px;
  }

  .typy-lista {
    max-height: 250px;
  }
}
</style>
