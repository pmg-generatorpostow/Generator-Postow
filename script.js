const canvas = document.getElementById('mojePlotno');
const ctx = canvas.getContext('2d');
const wgrajZdjecieInput = document.getElementById('wgrajZdjecie');
const inputImie = document.getElementById('tekstImie');
const inputStanowisko = document.getElementById('tekstStanowisko');

// Nowe elementy UI
const zoomInput = document.getElementById('zoomZdjecie');
const imageControls = document.getElementById('imageControls');
const zgodaWarunki = document.getElementById('zgodaWarunki');

// Zmienne do manipulacji zdjęciem
let zoomLevel = 1;
let imgOffsetX = 0;
let imgOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const tlo = new Image();
const zdjecieProfilowe = new Image();

// GŁÓWNA FUNKCJA RYSUJĄCA
function aktualizujPlotno() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rysujemy tło (teraz canvas ma wymiary obrazka)
    ctx.drawImage(tlo, 0, 0);

    if (zdjecieProfilowe.src) {
        // --- POZYCJA ZDJĘCIA PROFILOWEGO ---
        const startX = 69.6;
        const startY = 408.6;
        const szerokosc = 568.1;
        const wysokosc = 554.7;

        // Obliczamy środek i promienie dla maski przycinającej
        const srodekX = startX + szerokosc / 2;
        const srodekY = startY + wysokosc / 2;
        const promienX = szerokosc / 2;
        const promienY = wysokosc / 2;

        ctx.save();
        ctx.beginPath();
        // Używamy elipsy, ponieważ szerokość i wysokość delikatnie się różnią
        ctx.ellipse(srodekX, srodekY, promienX, promienY, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Obliczamy proporcje (zapobiega rozciąganiu zdjęcia jak 'object-fit: cover')
        const imgRatio = zdjecieProfilowe.width / zdjecieProfilowe.height;
        const boxRatio = szerokosc / wysokosc;

        let srcX = 0, srcY = 0, srcSzerokosc = zdjecieProfilowe.width, srcWysokosc = zdjecieProfilowe.height;

        if (imgRatio > boxRatio) {
            // Obraz jest szerszy niż box (przycinamy lewy i prawy bok)
            srcSzerokosc = zdjecieProfilowe.height * boxRatio;
            srcX = (zdjecieProfilowe.width - srcSzerokosc) / 2;
        } else {
            // Obraz jest wyższy niż box (przycinamy górę i dół)
            srcWysokosc = zdjecieProfilowe.width / boxRatio;
            srcY = (zdjecieProfilowe.height - srcWysokosc) / 2;
        }

        // Zastosowanie przybliżenia
        let zoomedSrcSzerokosc = srcSzerokosc / zoomLevel;
        let zoomedSrcWysokosc = srcWysokosc / zoomLevel;

        // Skala pomiędzy docelowym rozmiarem (szerokosc/wysokosc) a rzeczywistym rozmiarem wycinka
        let scaleX = srcSzerokosc / szerokosc;
        let scaleY = srcWysokosc / wysokosc;

        let finalSrcX = srcX + (srcSzerokosc - zoomedSrcSzerokosc) / 2 - (imgOffsetX * scaleX) / zoomLevel;
        let finalSrcY = srcY + (srcWysokosc - zoomedSrcWysokosc) / 2 - (imgOffsetY * scaleY) / zoomLevel;

        // Rysujemy wycięty środek obrazu
        ctx.drawImage(zdjecieProfilowe, finalSrcX, finalSrcY, zoomedSrcSzerokosc, zoomedSrcWysokosc, startX, startY, szerokosc, wysokosc);
        ctx.restore();
    }

    // --- TEKST: IMIĘ I NAZWISKO (Granatowy box) ---
    const imieBoxX = 42.8;
    const imieBoxY = 952.9;
    const imieBoxSzerokosc = 776.1;
    const imieBoxWysokosc = 177.7;

    // Obliczamy środek granatowego boxa
    const imieSrodekX = imieBoxX + imieBoxSzerokosc / 2;

    // Z uwagi na to, że używamy tylko WIELKICH LITER, matematyczny środek często różni się od optycznego.
    // Dodajemy tu "+ 10" pikseli, aby przesunąć tekst lekko w dół. Jeśli nadal będzie za wysoko, możesz zwiększyć tę wartość (np. na +15 lub +20).
    const imieSrodekY = (imieBoxY + imieBoxWysokosc / 2) + 10;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Pozwala idealnie wyśrodkować tekst w pionie
    ctx.fillStyle = "white"; // Biały tekst na ciemnym tle

    // Dynamiczne dopasowanie rozmiaru czcionki
    let fontSizeImie = 72;
    ctx.font = `bold ${fontSizeImie}px Prompt`;
    const textImie = inputImie.value.toUpperCase();
    const maxSzerokoscTekstu = imieBoxSzerokosc - 40; // margines 20px z każdej strony

    // Jeśli tekst jest za szeroki, zmniejszamy czcionkę
    while (ctx.measureText(textImie).width > maxSzerokoscTekstu && fontSizeImie > 20) {
        fontSizeImie -= 2;
        ctx.font = `bold ${fontSizeImie}px Prompt`;
    }

    ctx.fillText(textImie, imieSrodekX, imieSrodekY);

    // --- TEKST: ORGANIZACJA / STANOWISKO (Różowy box) ---
    const rolaBoxX = 56.7;
    const rolaBoxY = 1050.5;
    const rolaBoxSzerokosc = 776.1;
    const rolaBoxWysokosc = 131.8;

    const rolaSrodekX = rolaBoxX + rolaBoxSzerokosc / 2;
    // Zwiększone przesunięcie w dół, aby tekst był widocznie niżej
    const rolaSrodekY = (rolaBoxY + rolaBoxWysokosc / 2) + 40;

    ctx.textBaseline = "middle"; // Utrzymujemy wyrównanie do środka w pionie

    // Dynamiczne dopasowanie rozmiaru czcionki dla Roli
    let fontSizeRola = 32; // Zmniejszony bazowy rozmiar (wcześniej 42)
    ctx.font = `bold ${fontSizeRola}px Prompt`; // Pogrubiona czcionka
    const textRola = inputStanowisko.value;
    const maxSzerokoscRola = rolaBoxSzerokosc - 40;

    while (ctx.measureText(textRola).width > maxSzerokoscRola && fontSizeRola > 16) {
        fontSizeRola -= 2;
        ctx.font = `bold ${fontSizeRola}px Prompt`;
    }

    ctx.fillText(textRola, rolaSrodekX, rolaSrodekY);
}

// KLUCZOWY FRAGMENT: Dynamiczne wymiary płótna
tlo.src = 'tlo.png'; // Zmień na .png jeśli jednak używasz png
tlo.onload = function () {
    // To sprawia, że canvas nie jest już tylko kwadratem 800x800,
    // ale przyjmuje rozmiar Twojego pliku graficznego:
    canvas.width = tlo.width;
    canvas.height = tlo.height;
    aktualizujPlotno();
};

// Obsługa zdjęcia profilowego (bez zmian)
wgrajZdjecieInput.addEventListener('change', function (zdarzenie) {
    const plik = zdarzenie.target.files[0];
    if (plik) {
        const czytnik = new FileReader();
        czytnik.onload = function (e) {
            zdjecieProfilowe.src = e.target.result;
            zdjecieProfilowe.onload = function () {
                // Reset ustawień
                zoomLevel = 1;
                imgOffsetX = 0;
                imgOffsetY = 0;
                if (zoomInput) zoomInput.value = 1;
                if (imageControls) {
                    imageControls.classList.remove('hidden');
                    imageControls.classList.add('flex');
                }
                aktualizujPlotno();
            };
        };
        czytnik.readAsDataURL(plik);
    }
});

inputImie.addEventListener('input', aktualizujPlotno);
inputStanowisko.addEventListener('input', aktualizujPlotno);

// --- OBSŁUGA ZUMOWANIA I PRZESUWANIA ZDJĘCIA ---
if (zoomInput) {
    zoomInput.addEventListener('input', function () {
        zoomLevel = parseFloat(this.value);
        aktualizujPlotno();
    });
}

// Logika przesuwania zdjęcia
function handleDragStart(clientX, clientY) {
    if (!zdjecieProfilowe.src) return false;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const startX = 69.6;
    const startY = 408.6;
    const szerokosc = 568.1;
    const wysokosc = 554.7;

    const srodekX = startX + szerokosc / 2;
    const srodekY = startY + wysokosc / 2;
    const promienX = szerokosc / 2;
    const promienY = wysokosc / 2;

    const dx = x - srodekX;
    const dy = y - srodekY;

    if ((dx * dx) / (promienX * promienX) + (dy * dy) / (promienY * promienY) <= 1) {
        isDragging = true;
        dragStartX = clientX;
        dragStartY = clientY;
        canvas.style.cursor = 'grabbing';
        return true;
    }
    return false;
}

function handleDragMove(clientX, clientY) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const dx = (clientX - dragStartX) * scaleX;
        const dy = (clientY - dragStartY) * scaleY;

        imgOffsetX += dx;
        imgOffsetY += dy;

        dragStartX = clientX;
        dragStartY = clientY;

        aktualizujPlotno();
        return true;
    }
    return false;
}

function handleDragEnd() {
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'default';
    }
}

// Przesuwanie myszą po płótnie
canvas.addEventListener('mousedown', function (e) {
    handleDragStart(e.clientX, e.clientY);
});

window.addEventListener('mousemove', function (e) {
    handleDragMove(e.clientX, e.clientY);
});

window.addEventListener('mouseup', handleDragEnd);

// Przesuwanie dotykiem (telefony)
canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (handleDragStart(touch.clientX, touch.clientY)) {
            // Zapobiegamy domyślnemu scrollowaniu strony jeśli dotknięto zdjęcia
            e.preventDefault();
        }
    }
}, { passive: false });

window.addEventListener('touchmove', function (e) {
    if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
        e.preventDefault();
    }
}, { passive: false });

window.addEventListener('touchend', handleDragEnd);

// Pobieranie
const przyciskPobierz = document.getElementById('przyciskPobierz');

if (zgodaWarunki) {
    zgodaWarunki.addEventListener('change', function () {
        przyciskPobierz.disabled = !this.checked;
    });
}

przyciskPobierz.addEventListener('click', function () {
    const daneObrazka = canvas.toDataURL('image/png');
    const tymczasowyLink = document.createElement('a');
    tymczasowyLink.href = daneObrazka;
    tymczasowyLink.download = 'post_pm_session.png';
    tymczasowyLink.click();
});

document.getElementById('przyciskReset').addEventListener('click', function () {
    inputImie.value = '';
    inputStanowisko.value = '';
    zdjecieProfilowe.src = '';
    wgrajZdjecieInput.value = '';

    // Reset zoom i przesunięcie
    zoomLevel = 1;
    imgOffsetX = 0;
    imgOffsetY = 0;
    if (zoomInput) zoomInput.value = 1;
    if (imageControls) {
        imageControls.classList.remove('flex');
        imageControls.classList.add('hidden');
    }
    if (zgodaWarunki) {
        zgodaWarunki.checked = false;
        przyciskPobierz.disabled = true;
    }

    aktualizujPlotno();
});