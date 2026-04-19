const canvas = document.getElementById('mojePlotno');
const ctx = canvas.getContext('2d');
const wgrajZdjecieInput = document.getElementById('wgrajZdjecie');
const inputImie = document.getElementById('tekstImie');
const inputStanowisko = document.getElementById('tekstStanowisko');

const tlo = new Image();
const zdjecieProfilowe = new Image();

// GŁÓWNA FUNKCJA RYSUJĄCA
function aktualizujPlotno() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rysujemy tło (teraz canvas ma wymiary obrazka)
    ctx.drawImage(tlo, 0, 0);
    
    if (zdjecieProfilowe.src) {
        // --- POZYCJA ZDJĘCIA PROFILOWEGO ---
        // Dopasowane do białego koła na Twojej grafice tlo.jpg
        const srodekX = 747; 
        const srodekY = 2114; 
        const promienKola = 852; 
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(srodekX, srodekY, promienKola, 0, Math.PI * 2); 
        ctx.closePath();
        ctx.clip(); 
        
        const startX = srodekX - promienKola;
        const startY = srodekY - promienKola;
        const rozmiar = promienKola * 2;
        
        ctx.drawImage(zdjecieProfilowe, startX, startY, rozmiar, rozmiar);
        ctx.restore();
    }
    
    // --- TEKST: IMIĘ I NAZWISKO (Granatowy box) ---
    ctx.textAlign = "center"; 
    ctx.fillStyle = "white"; // Biały tekst na ciemnym tle
    ctx.font = "bold 72px Arial"; // Większy font dla czytelności
    
    // Centrujemy tekst w poziomie (canvas.width / 2)
    // Pozycja Y = 785 (idealnie w granatowym prostokącie)
    ctx.fillText(inputImie.value.toUpperCase(), canvas.width / 2, 785); 
    
    // --- TEKST: ORGANIZACJA / STANOWISKO (Różowy box) ---
    ctx.font = "42px Arial";
    // Pozycja Y = 862 (idealnie w różowym prostokącie)
    ctx.fillText(inputStanowisko.value, canvas.width / 2, 862);
}

// KLUCZOWY FRAGMENT: Dynamiczne wymiary płótna
tlo.src = 'tlo.png'; // Zmień na .png jeśli jednak używasz png
tlo.onload = function() {
    // To sprawia, że canvas nie jest już tylko kwadratem 800x800,
    // ale przyjmuje rozmiar Twojego pliku graficznego:
    canvas.width = tlo.width;
    canvas.height = tlo.height;
    aktualizujPlotno();
};

// Obsługa zdjęcia profilowego (bez zmian)
wgrajZdjecieInput.addEventListener('change', function(zdarzenie) {
    const plik = zdarzenie.target.files[0]; 
    if (plik) {
        const czytnik = new FileReader();
        czytnik.onload = function(e) {
            zdjecieProfilowe.src = e.target.result;
            zdjecieProfilowe.onload = function() {
                aktualizujPlotno(); 
            };
        };
        czytnik.readAsDataURL(plik);
    }
});

inputImie.addEventListener('input', aktualizujPlotno);
inputStanowisko.addEventListener('input', aktualizujPlotno);

// Pobieranie (bez zmian)
const przyciskPobierz = document.getElementById('przyciskPobierz');
przyciskPobierz.addEventListener('click', function() {
    const daneObrazka = canvas.toDataURL('image/png');
    const tymczasowyLink = document.createElement('a');
    tymczasowyLink.href = daneObrazka;
    tymczasowyLink.download = 'post_pm_session.png';
    tymczasowyLink.click();
});

document.getElementById('przyciskReset').addEventListener('click', function() {
    inputImie.value = '';
    inputStanowisko.value = '';
    zdjecieProfilowe.src = '';
    wgrajZdjecieInput.value = '';
    aktualizujPlotno();
});