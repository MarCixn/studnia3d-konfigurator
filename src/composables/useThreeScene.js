import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { store } from '../stores/studniaStore'
import { watch } from 'vue'

// Dodaj BVH support do BufferGeometry
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export function useThreeScene(containerRef) {
    let scene, camera, renderer, controls
    let studniaGroup, miarkaYGroup, katomierzGroup, pomiarGroup

    function init() {
        const container = containerRef.value
        if (!container) return

        // Scena
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf0f0f0)

        // Kamera
        camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            10000
        )
        camera.position.set(1500, 2100, 1500) // ~45 stopni

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(container.clientWidth, container.clientHeight)
        renderer.shadowMap.enabled = true
        container.appendChild(renderer.domElement)

        // Kontrolki
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.15
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        }

        // Światła
        scene.add(new THREE.AmbientLight(0xffffff, 0.4))
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
        dirLight.position.set(500, 1000, 500)
        scene.add(dirLight)

        // Siatka
        scene.add(new THREE.GridHelper(3000, 30, 0xcccccc, 0xe0e0e0))

        // Grupy
        studniaGroup = new THREE.Group()
        miarkaYGroup = new THREE.Group()
        katomierzGroup = new THREE.Group()
        pomiarGroup = new THREE.Group()
        scene.add(studniaGroup, miarkaYGroup, katomierzGroup, pomiarGroup)

        // Kliknięcie dla pomiarów (rozróżnienie szybkiego kliknięcia od przeciągania)
        let mouseDownTime = 0
        let mouseDownPos = { x: 0, y: 0 }

        renderer.domElement.addEventListener('mousedown', (e) => {
            mouseDownTime = Date.now()
            mouseDownPos = { x: e.clientX, y: e.clientY }
        })

        renderer.domElement.addEventListener('mouseup', (e) => {
            const elapsed = Date.now() - mouseDownTime
            const dx = e.clientX - mouseDownPos.x
            const dy = e.clientY - mouseDownPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Szybkie kliknięcie: < 200ms i ruch < 5px
            if (elapsed < 200 && distance < 5) {
                onPomiarClick(e)
            }
        })

        // Resize
        window.addEventListener('resize', onResize)

        // Renderuj
        stworzStudnie()
        stworzMiarkaY()
        stworzKatomierz()
        animate()

        // Na mniejszych ekranach wyśrodkuj kamerę na starcie
        if (window.innerWidth <= 900) {
            setTimeout(() => centerCamera(), 100)
        }

        // Watche
        watch(
            () => [store.kategoria, store.wysokosc, store.glebokosc, store.mufyNaModelu, store.typyMuf, store.debugMode, store.marginesKolizyjny],
            () => {
                stworzStudnie()
                stworzMiarkaY()
                stworzKatomierz()
                aktualizujPomiar()
            },
            { deep: true }
        )
        watch(() => store.aktywneNarzedzie, () => {
            store.pomiarPunkty = []
            store.pomiarWynik = null
            clearGroup(pomiarGroup)
        })
    }

    // Aktualizuj pomiar gdy mufy się zmieniają
    function aktualizujPomiar() {
        if (store.pomiarPunkty.length === 0) return

        const promienZewn = store.kategoria / 2

        // Aktualizuj pozycje punktów przypiętych do muf
        for (const punkt of store.pomiarPunkty) {
            if (punkt.mufaIndex !== null && punkt.mufaIndex !== undefined) {
                const mufa = store.mufyNaModelu[punkt.mufaIndex]
                if (mufa) {
                    const katRad = ((mufa.kat + 270) * Math.PI) / 180
                    punkt.x = Math.cos(katRad) * promienZewn
                    punkt.z = Math.sin(katRad) * promienZewn
                    punkt.y = mufa.wysokoscOdDna
                }
            }
        }

        // Przerysuj wizualizację
        clearGroup(pomiarGroup)

        const sphereGeo = new THREE.SphereGeometry(15, 16, 16)
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })

        for (const punkt of store.pomiarPunkty) {
            const sphere = new THREE.Mesh(sphereGeo, sphereMat)
            sphere.position.set(punkt.x, punkt.y, punkt.z)
            pomiarGroup.add(sphere)
        }

        // Jeśli mamy 2 punkty - przerysuj linie i wynik
        if (store.pomiarPunkty.length === 2) {
            rysujPomiarWynik(store.pomiarPunkty[0], store.pomiarPunkty[1])
        }
    }

    // Rysuj linie i wynik pomiaru
    function rysujPomiarWynik(p1, p2) {
        const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 })

        const stalyX = (p1.x + p2.x) / 2
        const stalyY = (p1.y + p2.y) / 2
        const stalyZ = (p1.z + p2.z) / 2

        if (store.aktywneNarzedzie === 'odleglosc') {
            pomiarGroup.add(createLine([
                [p1.x, stalyY, p1.z],
                [p2.x, stalyY, p2.z]
            ], lineMat))
        } else if (store.aktywneNarzedzie === 'wysokosc') {
            pomiarGroup.add(createLine([
                [stalyX, p1.y, stalyZ],
                [stalyX, p2.y, stalyZ]
            ], lineMat))
        } else if (store.aktywneNarzedzie === 'kat') {
            pomiarGroup.add(createLine([
                [0, stalyY, 0],
                [p1.x, stalyY, p1.z]
            ], lineMat))
            pomiarGroup.add(createLine([
                [0, stalyY, 0],
                [p2.x, stalyY, p2.z]
            ], lineMat))
        } else {
            pomiarGroup.add(createLine([
                [p1.x, p1.y, p1.z],
                [p2.x, p2.y, p2.z]
            ], lineMat))
        }

        // Oblicz wynik
        if (store.aktywneNarzedzie === 'wysokosc') {
            store.pomiarWynik = Math.abs(p2.y - p1.y).toFixed(0) + ' mm'
        } else if (store.aktywneNarzedzie === 'odleglosc') {
            const dx = p2.x - p1.x
            const dz = p2.z - p1.z
            const dist = Math.sqrt(dx * dx + dz * dz)
            store.pomiarWynik = dist.toFixed(0) + ' mm'
        } else if (store.aktywneNarzedzie === 'odleglosc3d') {
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const dz = p2.z - p1.z
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
            store.pomiarWynik = dist.toFixed(0) + ' mm'
        } else if (store.aktywneNarzedzie === 'kat') {
            const kat1 = Math.atan2(p1.z, p1.x) * (180 / Math.PI)
            const kat2 = Math.atan2(p2.z, p2.x) * (180 / Math.PI)
            let roznica = Math.abs(kat2 - kat1)
            if (roznica > 180) roznica = 360 - roznica
            store.pomiarWynik = roznica.toFixed(0) + '°'
        }

        // Etykieta wyniku
        let midPoint
        if (store.aktywneNarzedzie === 'kat') {
            midPoint = new THREE.Vector3(50, stalyY + 50, 50)
        } else {
            midPoint = new THREE.Vector3(stalyX + 50, stalyY + 50, stalyZ)
        }
        const label = createLabel(store.pomiarWynik, 0xf59e0b)
        label.position.copy(midPoint)
        label.scale.set(120, 60, 1)
        pomiarGroup.add(label)
    }

    function stworzStudnie() {
        clearGroup(studniaGroup)

        const promienZewn = store.kategoria / 2
        const gruboscScianki = 80
        const promienWewn = promienZewn - gruboscScianki
        const csgEvaluator = new Evaluator()

        const matStudnia = new THREE.MeshPhongMaterial({ color: 0x808080, vertexColors: false })
        const matDno = new THREE.MeshPhongMaterial({ color: 0x505050 })

        // Ściana studni jako solidna geometria (pierścień wyciągnięty)
        const wallShape = new THREE.Shape()
        wallShape.absarc(0, 0, promienZewn, 0, Math.PI * 2, false)
        const wallHole = new THREE.Path()
        wallHole.absarc(0, 0, promienWewn, 0, Math.PI * 2, true)
        wallShape.holes.push(wallHole)

        const wallGeometry = new THREE.ExtrudeGeometry(wallShape, {
            depth: store.wysokosc,
            bevelEnabled: false,
            curveSegments: 64
        })
        wallGeometry.rotateX(-Math.PI / 2)

        let wallBrush = new Brush(wallGeometry, matStudnia)
        wallBrush.updateMatrixWorld()

        // Wytnij dziury dla każdej mufy
        store.mufyNaModelu.forEach(mufa => {
            const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)
            if (!typ) return

            const outerRadius = typ.srZewn / 2
            const dlugoscOtworu = gruboscScianki + 50 // trochę dłuższy żeby przebić na wylot

            // Cylinder do wycięcia otworu (średnica zewnętrzna mufy)
            const holeGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, dlugoscOtworu, 32)
            holeGeometry.rotateZ(Math.PI / 2)

            const katRad = ((mufa.kat + 270) * Math.PI) / 180
            const holeBrush = new Brush(holeGeometry)
            // Otwór na środku ściany
            const holeOffset = promienZewn - gruboscScianki / 2
            holeBrush.position.x = Math.cos(katRad) * holeOffset
            holeBrush.position.z = Math.sin(katRad) * holeOffset
            holeBrush.position.y = mufa.wysokoscOdDna
            holeBrush.rotation.y = -katRad
            holeBrush.updateMatrixWorld()

            // Odejmij otwór od ściany
            wallBrush = csgEvaluator.evaluate(wallBrush, holeBrush, SUBTRACTION)
        })

        const wallMesh = new THREE.Mesh(wallBrush.geometry, matStudnia)
        studniaGroup.add(wallMesh)

        // Dno (wewnątrz studni)
        const dno = new THREE.Mesh(
            new THREE.CircleGeometry(promienWewn, 64),
            matDno
        )
        dno.rotation.x = -Math.PI / 2
        dno.position.y = store.glebokosc
        studniaGroup.add(dno)

        // Mufy - rury zatopione w ścianie
        const kolizjeMeshe = [] // przechowuj meshe kolizyjne do sprawdzenia

        store.mufyNaModelu.forEach((mufa, index) => {
            const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)
            if (!typ) return

            const matMufa = new THREE.MeshPhongMaterial({
                color: typ.kolor || 0xe94560,
                side: THREE.DoubleSide
            })

            const outerRadius = typ.srZewn / 2
            const innerRadius = typ.srWewn / 2
            const wystajNaZewn = -123 // skrócona o 173mm od zewnątrz (było 50, teraz 50-173=-123)
            let wystajDoSrodka = 147 // ile wystaje do środka studni od wewnętrznej ściany
            let dodatkowe70mm = 0

            // Jeśli średnica zewnętrzna > 288mm, wydłuż DO ŚRODKA STUDNI o 70mm
            if (typ.srZewn > 288) {
                wystajDoSrodka += 70  // 147 + 70 = 217mm (dłuższa do środka)
                dodatkowe70mm = 70
            }

            const dlugoscMufy = gruboscScianki + wystajNaZewn + wystajDoSrodka

            // Kształt pierścienia (przekrój mufy)
            const shape = new THREE.Shape()
            shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)
            const hole = new THREE.Path()
            hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
            shape.holes.push(hole)

            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: dlugoscMufy,
                bevelEnabled: false,
                curveSegments: 32
            })
            geometry.rotateX(Math.PI / 2)
            // Przesuń o połowę długości + dodatkową połowę 70mm w kierunku środka
            geometry.translate(0, -dlugoscMufy / 2 - dodatkowe70mm / 2, 0)

            const mesh = new THREE.Mesh(geometry, matMufa)

            const katRad = ((mufa.kat + 270) * Math.PI) / 180
            // Pozycja: 154.5mm bliżej środka sceny (korekta -170mm)
            let mufaPos = promienZewn - 154.5

            // Jeśli średnica > 288mm, przesuń CAŁĄ mufę 110mm w kierunku środka
            if (typ.srZewn > 288) {
                mufaPos -= 110
            }

            mesh.position.x = Math.cos(katRad) * mufaPos
            mesh.position.z = Math.sin(katRad) * mufaPos
            mesh.position.y = mufa.wysokoscOdDna
            mesh.rotation.z = Math.PI / 2
            mesh.rotation.y = -katRad

            studniaGroup.add(mesh)

            // Utwórz mesh kolizyjny (cylinder z marginesem)
            const kolizjaRadius = outerRadius + store.marginesKolizyjny
            const kolizjaShape = new THREE.Shape()
            kolizjaShape.absarc(0, 0, kolizjaRadius, 0, Math.PI * 2, false)

            const kolizjaGeo = new THREE.ExtrudeGeometry(kolizjaShape, {
                depth: dlugoscMufy,
                bevelEnabled: false,
                curveSegments: 16
            })
            kolizjaGeo.rotateX(Math.PI / 2)
            // Przesuń tak samo jak główną geometrię - w kierunku środka studni
            kolizjaGeo.translate(0, -dlugoscMufy / 2 - dodatkowe70mm / 2, 0)

            // Zbuduj BVH tree dla precyzyjnej detekcji kolizji
            kolizjaGeo.computeBoundsTree()

            // Materiał: niewidoczny normalnie, widoczny w debug mode
            const kolizjaMat = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: store.debugMode ? 0.2 : 0,
                side: THREE.DoubleSide,
                depthTest: false
            })

            const kolizjaMesh = new THREE.Mesh(kolizjaGeo, kolizjaMat)
            kolizjaMesh.position.copy(mesh.position)
            kolizjaMesh.rotation.copy(mesh.rotation)
            kolizjaMesh.renderOrder = 999 // Renderuj po wszystkim
            kolizjaMesh.userData.index = index
            kolizjaMesh.userData.radius = kolizjaRadius // Zapisz promień czerwonego cylindra
            kolizjaMesh.userData.length = dlugoscMufy // Zapisz długość
            kolizjeMeshe.push(kolizjaMesh)
            studniaGroup.add(kolizjaMesh)

            // Wireframe tylko w debug mode
            if (store.debugMode) {
                const wireMat = new THREE.LineBasicMaterial({ color: 0xff0000 })
                const wireGeo = new THREE.WireframeGeometry(kolizjaGeo)
                const wireMesh = new THREE.LineSegments(wireGeo, wireMat)
                wireMesh.position.copy(mesh.position)
                wireMesh.rotation.copy(mesh.rotation)
                studniaGroup.add(wireMesh)
            }
        })

        // Sprawdź kolizje - CZERWONY cylinder do CZERWONEGO cylindra (prosta odległość 3D)
        const wykryteKolizje = []

        for (let i = 0; i < kolizjeMeshe.length; i++) {
            const cyl1 = kolizjeMeshe[i]
            const r1 = cyl1.userData.radius
            const pos1 = cyl1.position

            for (let j = i + 1; j < kolizjeMeshe.length; j++) {
                const cyl2 = kolizjeMeshe[j]
                const r2 = cyl2.userData.radius
                const pos2 = cyl2.position

                // Odległość 3D między środkami CZERWONYCH cylindrów
                const dx = pos2.x - pos1.x
                const dy = pos2.y - pos1.y
                const dz = pos2.z - pos1.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                // Kolizja jeśli odległość między środkami < suma promieni
                // UWAGA: Margines jest już w r1 i r2, więc odejmujemy jeden margines
                // żeby nie liczyć podwójnie
                const sumaPromieni = r1 + r2 - store.marginesKolizyjny

                if (distance < sumaPromieni) {
                    wykryteKolizje.push([i, j])
                }
            }
        }
        store.kolizje = wykryteKolizje
    }

    // Miarka Y - zawsze włączona
    function stworzMiarkaY() {
        clearGroup(miarkaYGroup)

        const offset = store.kategoria / 2 + 350
        const mat = new THREE.LineBasicMaterial({ color: 0x22c55e })

        // Linia główna
        miarkaYGroup.add(createLine([
            [offset, 0, 0],
            [offset, store.wysokosc, 0]
        ], mat))

        // Podziałka
        for (let y = 0; y <= store.wysokosc; y += 100) {
            const dl = (y % 500 === 0) ? 50 : 25
            miarkaYGroup.add(createLine([
                [offset - dl, y, 0],
                [offset, y, 0]
            ], mat))

            if (y % 500 === 0 && y < store.wysokosc) {
                const sprite = createLabel(y + '', 0x22c55e)
                sprite.position.set(offset + 80, y, 0)
                sprite.scale.set(140, 70, 1)
                miarkaYGroup.add(sprite)
            }
        }

        // Etykieta wysokości studni na górze
        const labelTop = createLabel(store.wysokosc + ' mm', 0x22c55e)
        labelTop.position.set(offset + 100, store.wysokosc, 0)
        labelTop.scale.set(180, 90, 1)
        miarkaYGroup.add(labelTop)
    }

    // Kątomierz - zawsze włączony na wysokości studni
    function stworzKatomierz() {
        clearGroup(katomierzGroup)

        const y = store.wysokosc
        const promien = store.kategoria / 2 + 150
        const mat = new THREE.LineBasicMaterial({ color: 0x3b82f6 })

        // Okrąg
        const punkty = []
        for (let i = 0; i <= 360; i += 5) {
            const rad = (i * Math.PI) / 180
            punkty.push([Math.cos(rad) * promien, y, Math.sin(rad) * promien])
        }
        katomierzGroup.add(createLine(punkty, mat))

        // Podziałka (przesunięta o 270° żeby 0° było na dole)
        const offset = 270
        for (let kat = 0; kat < 360; kat += 15) {
            const radReal = ((kat + offset) * Math.PI) / 180
            const r1 = (kat % 45 === 0) ? promien - 60 : promien - 30
            katomierzGroup.add(createLine([
                [Math.cos(radReal) * r1, y, Math.sin(radReal) * r1],
                [Math.cos(radReal) * promien, y, Math.sin(radReal) * promien]
            ], mat))

            if (kat % 90 === 0) {
                const sprite = createLabel(kat + '°', 0x3b82f6)
                sprite.position.set(
                    Math.cos(radReal) * (promien + 100),
                    y + 30,
                    Math.sin(radReal) * (promien + 100)
                )
                sprite.scale.set(120, 60, 1)
                katomierzGroup.add(sprite)
            }
        }

        // Wskazówka na 0° (teraz na dole)
        const matWsk = new THREE.LineBasicMaterial({ color: 0xef4444 })
        const rad0 = ((0 + offset) * Math.PI) / 180
        katomierzGroup.add(createLine([
            [0, y, 0],
            [Math.cos(rad0) * promien, y, Math.sin(rad0) * promien]
        ], matWsk))
    }

    // Kliknięcie dla pomiarów point-to-point
    function onPomiarClick(event) {
        if (!store.aktywneNarzedzie) return

        // Jeśli mamy już 2 punkty, resetuj pomiar
        if (store.pomiarPunkty.length >= 2) {
            store.pomiarPunkty = []
            store.pomiarWynik = null
            clearGroup(pomiarGroup)
        }

        const rect = renderer.domElement.getBoundingClientRect()
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        )

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)

        // Znajdź punkt na modelu lub płaszczyźnie
        const intersects = raycaster.intersectObjects(studniaGroup.children, true)
        let punkt

        if (intersects.length > 0) {
            punkt = intersects[0].point.clone()
        } else {
            // Płaszczyzna Y=0
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
            punkt = new THREE.Vector3()
            if (!raycaster.ray.intersectPlane(plane, punkt)) return
        }

        // Sprawdź czy kliknięto blisko mufy - jeśli tak, użyj jej środka
        // WYŁĄCZONE dla pomiaru 3D (odleglosc3d) - tylko punkt-punkt bez snap
        const promienZewn = store.kategoria / 2
        let mufaIndex = null

        if (store.aktywneNarzedzie !== 'odleglosc3d') {
            for (let i = 0; i < store.mufyNaModelu.length; i++) {
                const mufa = store.mufyNaModelu[i]
                const typ = store.typyMuf.find(t => t.nazwa === mufa.rodzaj)
                if (!typ) continue

                const katRad = ((mufa.kat + 270) * Math.PI) / 180
                const mufaCenterX = Math.cos(katRad) * promienZewn
                const mufaCenterZ = Math.sin(katRad) * promienZewn
                const mufaCenterY = mufa.wysokoscOdDna

                // Odległość od środka mufy
                const dx = punkt.x - mufaCenterX
                const dy = punkt.y - mufaCenterY
                const dz = punkt.z - mufaCenterZ
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

                // Jeśli blisko mufy (w promieniu zewnętrznym + margines), użyj środka
                const promienMufy = typ.srZewn / 2 + 50
                if (dist < promienMufy) {
                    punkt.x = mufaCenterX
                    punkt.y = mufaCenterY
                    punkt.z = mufaCenterZ
                    mufaIndex = i
                    break
                }
            }
        }

        // Dodaj punkt z opcjonalnym indeksem mufy
        store.pomiarPunkty.push({ x: punkt.x, y: punkt.y, z: punkt.z, mufaIndex })

        // Wizualizacja punktu
        const sphereGeo = new THREE.SphereGeometry(15, 16, 16)
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        const sphere = new THREE.Mesh(sphereGeo, sphereMat)
        sphere.position.copy(punkt)
        pomiarGroup.add(sphere)

        // Jeśli mamy 2 punkty - oblicz i rysuj
        if (store.pomiarPunkty.length === 2) {
            rysujPomiarWynik(store.pomiarPunkty[0], store.pomiarPunkty[1])
        }
    }

    function onResize() {
        const container = containerRef.value
        if (!container) return
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)

        // Na mniejszych ekranach wyśrodkuj
        if (window.innerWidth <= 900) {
            centerCamera()
        }
    }

    function animate() {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }

    // Helpers
    function clearGroup(group) {
        while (group.children.length > 0) {
            group.remove(group.children[0])
        }
    }

    function createLine(points, material) {
        const geometry = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p[0], p[1], p[2]))
        )
        return new THREE.Line(geometry, material)
    }

    function createLabel(text, color) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 256
        canvas.height = 128

        // Tło z zaokrąglonymi rogami
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 12)
        ctx.fill()

        // Reset cienia dla tekstu
        ctx.shadowColor = 'transparent'

        // Tekst
        ctx.font = 'bold 48px Arial'
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }))
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
    }

    function dispose() {
        window.removeEventListener('resize', onResize)
        renderer?.dispose()
    }

    function centerCamera() {
        if (!controls || !camera) return
        controls.target.set(0, store.wysokosc / 2, 0)
        // Na mniejszych ekranach kamera bliżej
        // Kąt 45 stopni: Y offset = dystans poziomy * sqrt(2) / 2
        const dist = window.innerWidth <= 600 ? 1200 : 1500
        const yOffset = dist * 1.4 // ~45 stopni
        camera.position.set(dist, store.wysokosc / 2 + yOffset, dist)
        controls.update()
    }

    return { init, dispose, centerCamera }
}
