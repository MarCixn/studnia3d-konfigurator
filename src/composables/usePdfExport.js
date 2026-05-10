import { jsPDF } from 'jspdf'
import { store } from '../stores/studniaStore'

// Mapowanie polskich znaków na ASCII
function bezPolskichZnakow(str) {
    const map = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
        'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    }
    return str.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => map[char] || char)
}

export function usePdfExport() {

    function generujNumerZlecenia() {
        const now = new Date()
        const rok = now.getFullYear()
        const miesiac = String(now.getMonth() + 1).padStart(2, '0')
        const dzien = String(now.getDate()).padStart(2, '0')
        const losowy = Math.floor(Math.random() * 9000) + 1000
        return `ZL/${rok}${miesiac}${dzien}/${losowy}`
    }

    function rysujKatomierz(doc, centerX, centerY, promien, skala) {
        // Okrąg zewnętrzny
        doc.setDrawColor(59, 130, 246)
        doc.setLineWidth(0.5)
        doc.circle(centerX, centerY, promien)

        // Okrąg wewnętrzny (ściana studni)
        const promienWewn = (store.kategoria / 2 - 80) * skala
        doc.setDrawColor(128, 128, 128)
        doc.circle(centerX, centerY, promienWewn)

        // Podziałka kątowa
        doc.setFontSize(6)
        doc.setTextColor(59, 130, 246)
        for (let kat = 0; kat < 360; kat += 15) {
            const radReal = ((kat + 270) * Math.PI) / 180
            const r1 = (kat % 45 === 0) ? promien - 4 : promien - 2

            const x1 = centerX + Math.cos(radReal) * r1
            const y1 = centerY + Math.sin(radReal) * r1
            const x2 = centerX + Math.cos(radReal) * promien
            const y2 = centerY + Math.sin(radReal) * promien

            doc.line(x1, y1, x2, y2)

            if (kat % 45 === 0) {
                const labelR = promien + 5
                const lx = centerX + Math.cos(radReal) * labelR
                const ly = centerY + Math.sin(radReal) * labelR
                doc.text(`${kat}°`, lx, ly, { align: 'center' })
            }
        }
    }

    function rysujMufyNaDiagramie(doc, centerX, centerY, skala) {
        const promienStudni = (store.kategoria / 2) * skala

        store.mufyNaModelu.forEach((mufa, index) => {
            const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)
            if (!typ) return

            const katRad = ((mufa.kat + 270) * Math.PI) / 180
            const outerR = (typ.srZewn / 2) * skala

            const x = centerX + Math.cos(katRad) * promienStudni
            const y = centerY + Math.sin(katRad) * promienStudni

            // Kolor mufy
            const kolor = typ.kolor || '#e94560'
            const r = parseInt(kolor.slice(1, 3), 16)
            const g = parseInt(kolor.slice(3, 5), 16)
            const b = parseInt(kolor.slice(5, 7), 16)

            doc.setFillColor(r, g, b)
            doc.setDrawColor(0, 0, 0)
            doc.setLineWidth(0.3)
            doc.circle(x, y, Math.max(outerR, 2), 'FD')

            // Numer mufy
            doc.setFontSize(6)
            doc.setTextColor(0, 0, 0)
            doc.text(`${index + 1}`, x, y + 0.5, { align: 'center' })
        })
    }

    function t(str) {
        return bezPolskichZnakow(String(str))
    }

    function generujPdf(nazwaFirmy = '') {
        const doc = new jsPDF('p', 'mm', 'a4')
        const pageWidth = 210
        const pageHeight = 297
        const margin = 15
        const numerZlecenia = generujNumerZlecenia()
        const data = new Date().toLocaleDateString('pl-PL')

        // ===== WATERMARK DEMO =====
        doc.setFontSize(80)
        doc.setTextColor(230, 230, 230)
        doc.text('DEMO', pageWidth / 2, pageHeight / 2, {
            align: 'center',
            angle: 45
        })

        // ===== NAGLOWEK =====
        doc.setFontSize(18)
        doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text(t('KARTA TECHNOLOGICZNA STUDNI'), pageWidth / 2, margin + 5, { align: 'center' })

        // Linia pod naglowkiem
        doc.setDrawColor(30, 64, 175)
        doc.setLineWidth(0.5)
        doc.line(margin, margin + 10, pageWidth - margin, margin + 10)

        // Info box
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')

        const infoY = margin + 18
        doc.text(t('Nr zlecenia: ') + numerZlecenia, margin, infoY)
        doc.text(t('Data: ') + data, margin + 70, infoY)
        doc.text(t('Klient: ') + (nazwaFirmy ? t(nazwaFirmy) : '___________________________'), margin, infoY + 6)

        // ===== PARAMETRY STUDNI =====
        const paramY = infoY + 16
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, paramY, pageWidth - 2 * margin, 20, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.rect(margin, paramY, pageWidth - 2 * margin, 20)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(t('PARAMETRY STUDNI'), margin + 3, paramY + 5)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const col1 = margin + 3
        const col2 = margin + 60
        const col3 = margin + 120
        doc.text(t('Kategoria (DN): ') + store.kategoria + ' mm', col1, paramY + 12)
        doc.text(t('Wysokosc: ') + store.wysokosc + ' mm', col2, paramY + 12)
        doc.text(t('Glebokosc dna: ') + store.glebokosc + ' mm', col3, paramY + 12)
        doc.text(t('Grubosc scianki: 80 mm'), col1, paramY + 17)
        doc.text(t('Liczba muf: ') + store.mufyNaModelu.length, col2, paramY + 17)

        // ===== DIAGRAM - WIDOK Z GORY =====
        const diagramY = paramY + 28
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(t('WIDOK Z GORY - ROZMIESZCZENIE MUF'), margin, diagramY)

        const diagramCenterX = pageWidth / 2
        const diagramCenterY = diagramY + 50
        const maxPromien = 45
        const skala = maxPromien / (store.kategoria / 2 + 200)

        rysujKatomierz(doc, diagramCenterX, diagramCenterY, maxPromien, skala)
        rysujMufyNaDiagramie(doc, diagramCenterX, diagramCenterY, skala)

        // Legenda kierunkow
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text(t('0 stopni = przod'), diagramCenterX, diagramCenterY + maxPromien + 12, { align: 'center' })

        // ===== TABELA MUF =====
        const tableY = diagramCenterY + maxPromien + 20
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(t('SPECYFIKACJA MUF'), margin, tableY)

        // Naglowki tabeli
        const tableStartY = tableY + 5
        const colWidths = [12, 30, 25, 35, 35, 43]
        const headers = ['Nr', 'Rodzaj', 'Kat', 'Wys. od dna', 'Sr. zew./wew.', 'Uwagi']

        doc.setFillColor(30, 64, 175)
        doc.rect(margin, tableStartY, pageWidth - 2 * margin, 7, 'F')

        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')

        let xPos = margin + 2
        headers.forEach((header, i) => {
            doc.text(t(header), xPos, tableStartY + 5)
            xPos += colWidths[i]
        })

        // Wiersze tabeli
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')

        let rowY = tableStartY + 7
        store.mufyNaModelu.forEach((mufa, index) => {
            const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)

            // Tlo co drugi wiersz
            if (index % 2 === 0) {
                doc.setFillColor(248, 248, 248)
                doc.rect(margin, rowY, pageWidth - 2 * margin, 6, 'F')
            }

            xPos = margin + 2
            doc.text(String(index + 1), xPos, rowY + 4)
            xPos += colWidths[0]
            doc.text(t(mufa.rodzaj), xPos, rowY + 4)
            xPos += colWidths[1]
            doc.text(mufa.kat + ' st.', xPos, rowY + 4)
            xPos += colWidths[2]
            doc.text(mufa.wysokoscOdDna + ' mm', xPos, rowY + 4)
            xPos += colWidths[3]
            if (typ) {
                doc.text(typ.srZewn + '/' + typ.srWewn + ' mm', xPos, rowY + 4)
            }

            rowY += 6
        })

        // Ramka tabeli
        doc.setDrawColor(200, 200, 200)
        const tableHeight = 7 + store.mufyNaModelu.length * 6
        doc.rect(margin, tableStartY, pageWidth - 2 * margin, tableHeight)

        // ===== TYPY MUF =====
        const typyY = rowY + 10
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(t('DOSTEPNE TYPY MUF'), margin, typyY)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        let typY = typyY + 6
        store.typyMuf.forEach(typ => {
            doc.text(t(typ.nazwa) + ': Sr.zew. ' + typ.srZewn + 'mm, Sr.wew. ' + typ.srWewn + 'mm, Margines: ' + (typ.margines || 0) + 'mm', margin, typY)
            typY += 5
        })

        // ===== KOLIZJE =====
        if (store.kolizje && store.kolizje.length > 0) {
            doc.setFillColor(254, 226, 226)
            doc.rect(margin, typY + 2, pageWidth - 2 * margin, 8, 'F')
            doc.setTextColor(185, 28, 28)
            doc.setFont('helvetica', 'bold')
            doc.text(t('UWAGA: WYKRYTO KOLIZJE MUF!'), margin + 3, typY + 7)
            doc.setFont('helvetica', 'normal')
            const kolizjeStr = store.kolizje.map(([i, j]) => '#' + (i + 1) + ' - #' + (j + 1)).join(', ')
            doc.text(t('Kolidujace mufy: ') + kolizjeStr, margin + 65, typY + 7)
            typY += 12
        }

        // ===== PODPISY =====
        const footerY = pageHeight - 40
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.3)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(0, 0, 0)

        doc.text(t('Sporzadzil:'), margin, footerY)
        doc.line(margin + 20, footerY, margin + 70, footerY)

        doc.text('Data:', margin + 80, footerY)
        doc.line(margin + 90, footerY, margin + 120, footerY)

        doc.text(t('Zatwierdzil:'), margin, footerY + 12)
        doc.line(margin + 22, footerY + 12, margin + 70, footerY + 12)

        doc.text('Data:', margin + 80, footerY + 12)
        doc.line(margin + 90, footerY + 12, margin + 120, footerY + 12)

        doc.text(t('Kontrola jakosci:'), margin, footerY + 24)
        doc.line(margin + 32, footerY + 24, margin + 70, footerY + 24)

        doc.text('Data:', margin + 80, footerY + 24)
        doc.line(margin + 90, footerY + 24, margin + 120, footerY + 24)

        // Stopka
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(t('Wygenerowano: ') + new Date().toLocaleString('pl-PL') + ' | Studnia DN' + store.kategoria, pageWidth / 2, pageHeight - 10, { align: 'center' })

        // Autor - prawy dolny rog
        doc.setFontSize(6)
        doc.setTextColor(180, 180, 180)
        doc.text('Demo konfigurator studni wykonany przez: Marcin Lotocki', pageWidth - margin, pageHeight - 5, { align: 'right' })

        // Otworz PDF w nowej karcie
        const pdfUrl = doc.output('bloburl')
        window.open(pdfUrl, '_blank')
    }

    return { generujPdf, generujNumerZlecenia }
}
