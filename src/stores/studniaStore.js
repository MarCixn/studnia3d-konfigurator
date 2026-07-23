import { reactive, watch } from 'vue'

// Funkcje cookies
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
}

function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${value}; expires=${expires}; path=/`
}

// Wczytaj preferencje z cookies
const savedMufyOdDna = getCookie('mufyOdDna')
const savedMufyOdSrodka = getCookie('mufyOdSrodka')

// Wczytaj typy muf z localStorage
function getTypyMufFromStorage() {
    try {
        const saved = localStorage.getItem('typyMuf')
        if (saved) {
            const parsed = JSON.parse(saved)
            // Sprawdź czy są jakieś własne typy (ponad 3 domyślne)
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed
            }
        }
    } catch (e) {
        console.warn('Błąd wczytywania typów muf:', e)
    }
    // Zwróć domyślne typy jeśli nie ma zapisanych
    return [
        { nazwa: 'DN110', srWewn: 110, srZewn: 125, kolor: '#ffffff' },
        { nazwa: 'DN160', srWewn: 160, srZewn: 180, kolor: '#ffffff' },
        { nazwa: 'DN200', srWewn: 200, srZewn: 225, kolor: '#e94560' }
    ]
}

const savedTypyMuf = getTypyMufFromStorage()

// Centralny stan aplikacji - wszystkie komponenty go widzą
export const store = reactive({
    // Parametry studni
    kategoria: 1000,
    wysokosc: 800,
    glebokosc: 200,

    // Typy muf (definicje) - wczytane z localStorage lub domyślne
    typyMuf: savedTypyMuf,

    // Globalny margines kolizyjny
    marginesKolizyjny: 20,

    // Mufy dodane na model (testowe)
    mufyNaModelu: [
        { rodzaj: 'DN200', kat: 0, wysokoscOdDna: 300 },
        { rodzaj: 'DN110', kat: 153, wysokoscOdDna: 510 },
        { rodzaj: 'DN160', kat: 250, wysokoscOdDna: 420 }
    ],

    // Preferencje
    mufyOdDna: savedMufyOdDna !== null ? savedMufyOdDna === 'true' : true, // domyślnie od dna
    mufyOdSrodka: savedMufyOdSrodka !== null ? savedMufyOdSrodka === 'true' : false, // domyślnie od średnicy wewnętrznej
    debugMode: false,

    // Narzędzia pomiarowe (stałe)
    katomierzWysokosc: 500,

    // Narzędzia point-to-point
    aktywneNarzedzie: null, // 'wysokosc', 'odleglosc', 'kat'
    pomiarPunkty: [],
    pomiarWynik: null,

    // Kolizje wykryte przez Box3
    kolizje: []
})

// Zapisuj preferencje przy zmianie
watch(() => store.mufyOdDna, (val) => {
    setCookie('mufyOdDna', val)
})
watch(() => store.mufyOdSrodka, (val) => {
    setCookie('mufyOdSrodka', val)
})

// Zapisuj typy muf do localStorage przy każdej zmianie
watch(() => store.typyMuf, (typyMuf) => {
    try {
        localStorage.setItem('typyMuf', JSON.stringify(typyMuf))
    } catch (e) {
        console.warn('Błąd zapisywania typów muf:', e)
    }
}, { deep: true })

// Akcje - funkcje modyfikujące stan
export const actions = {
    // Typy muf
    dodajTypMufy(nazwa, srWewn, srZewn, kolor) {
        if (!nazwa || store.typyMuf.some(t => t.nazwa === nazwa)) return false
        if (srWewn >= srZewn) return false
        store.typyMuf.push({ nazwa, srWewn, srZewn, kolor: kolor || '#e94560' })
        return true
    },

    usunTypMufy(index) {
        const nazwa = store.typyMuf[index].nazwa
        if (store.mufyNaModelu.some(m => m.rodzaj === nazwa)) return false
        store.typyMuf.splice(index, 1)
        return true
    },

    // Mufy na modelu
    dodajMufe(rodzaj, kat, wysokoscOdDna) {
        if (store.mufyNaModelu.length >= 20) return false
        if (!rodzaj || wysokoscOdDna > store.wysokosc) return false
        store.mufyNaModelu.push({ rodzaj, kat, wysokoscOdDna })
        return true
    },

    usunMufe(index) {
        store.mufyNaModelu.splice(index, 1)
    }
}
