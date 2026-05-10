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

// Centralny stan aplikacji - wszystkie komponenty go widzą
export const store = reactive({
    // Parametry studni
    kategoria: 1000,
    wysokosc: 800,
    glebokosc: 200,

    // Typy muf (definicje)
    typyMuf: [
        { nazwa: 'DN110', srWewn: 110, srZewn: 125, kolor: '#ffffff', margines: 20 },
        { nazwa: 'DN160', srWewn: 160, srZewn: 180, kolor: '#ffffff', margines: 20 },
        { nazwa: 'DN200', srWewn: 200, srZewn: 225, kolor: '#e94560', margines: 20 }
    ],

    // Mufy dodane na model
    mufyNaModelu: [],

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

// Akcje - funkcje modyfikujące stan
export const actions = {
    // Typy muf
    dodajTypMufy(nazwa, srWewn, srZewn, kolor, margines) {
        if (!nazwa || store.typyMuf.some(t => t.nazwa === nazwa)) return false
        if (srWewn >= srZewn) return false
        store.typyMuf.push({ nazwa, srWewn, srZewn, kolor: kolor || '#e94560', margines: margines || 20 })
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
    },

    // Sprawdź kolizje między mufami
    sprawdzKolizje() {
        const kolizje = []
        const mufy = store.mufyNaModelu

        for (let i = 0; i < mufy.length; i++) {
            for (let j = i + 1; j < mufy.length; j++) {
                if (this.czyKoliduja(mufy[i], mufy[j])) {
                    kolizje.push([i, j])
                }
            }
        }
        return kolizje
    },

    czyKoliduja(mufa1, mufa2) {
        const typ1 = store.typyMuf.find(t => t.nazwa === mufa1.rodzaj)
        const typ2 = store.typyMuf.find(t => t.nazwa === mufa2.rodzaj)
        if (!typ1 || !typ2) return false

        const r1 = typ1.srZewn / 2 + (typ1.margines || 0)
        const r2 = typ2.srZewn / 2 + (typ2.margines || 0)

        // Różnica wysokości
        const dy = Math.abs(mufa2.wysokoscOdDna - mufa1.wysokoscOdDna)

        // Różnica kąta - odległość po obwodzie
        const promienZewn = store.kategoria / 2
        const mufaPos = promienZewn - 154.5
        let dKat = Math.abs(mufa2.kat - mufa1.kat)
        if (dKat > 180) dKat = 360 - dKat
        const dLuk = (dKat * Math.PI / 180) * mufaPos

        // Odległość 2D: wysokość + łuk
        const odleglosc = Math.sqrt(dy * dy + dLuk * dLuk)

        // Kolizja jeśli odległość <= suma promieni
        return odleglosc <= (r1 + r2)
    }
}
