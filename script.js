// ============================================================
// KONFIGURACJA — adres wdrożenia Apps Script
// Dopóki pusty, formularz działa w trybie demo.
// ============================================================
const APPS_SCRIPT_URL = '';

// ===== MENU MOBILNE =====
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });
}

// ===== ANIMACJE POJAWIANIA SIĘ =====
const sections = document.querySelectorAll('.section, .hero, .page-hero');
sections.forEach(s => s.classList.add('fade-in'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

sections.forEach(s => observer.observe(s));

// ===== STRONA POTWIERDZENIA (rezerwacja-potwierdzenie.html) =====
const confirmBox = document.getElementById('confirm-box');

if (confirmBox) {
  const rezerwacja = JSON.parse(sessionStorage.getItem('ostatniaRezerwacja') || 'null');

  if (rezerwacja) {
    document.getElementById('confirm-data').textContent = rezerwacja.dataPL;
    document.getElementById('confirm-numer').textContent = rezerwacja.numer;
    document.getElementById('confirm-tytul').textContent = `KAUCJA ${rezerwacja.dataPL}`;
    document.getElementById('confirm-kwota').textContent = `Twoja kaucja: ${rezerwacja.kwota}`;

    const btnCopy = document.getElementById('copy-tytul');
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`KAUCJA ${rezerwacja.dataPL}`);
        btnCopy.textContent = 'Skopiowano ✓';
      } catch {
        btnCopy.textContent = 'Skopiuj ręcznie tytuł powyżej';
      }
    });
  } else {
    document.getElementById('confirm-tekst').textContent =
      'Nie znaleźliśmy szczegółów rezerwacji. Jeśli coś poszło nie tak — zadzwoń: 667 436 655.';
  }
}

// ===== WŁASNY KALENDARZ DOSTĘPNOŚCI =====
const calDays = document.getElementById('cal-days');
const calMonthLabel = document.getElementById('cal-month');

const NAZWY_MIESIECY = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
];

let widokRok, widokMiesiac;
const dzis = new Date();
widokRok = dzis.getFullYear();
widokMiesiac = dzis.getMonth();

let zaplaconeDni = new Set();
let oczekujaceDni = new Set();

function formatujDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dz = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dz}`;
}

async function pobierzDni() {
  if (!APPS_SCRIPT_URL) return;

  try {
    const odpowiedz = await fetch(APPS_SCRIPT_URL);
    const dane = await odpowiedz.json();
    oczekujaceDni = new Set(dane.oczekujace || []);
    zaplaconeDni = new Set(dane.zaplacone || []);
  } catch (blad) {
    console.error('Nie udało się pobrać terminów:', blad);
  }
}

async function rysujKalendarz() {
  await pobierzDni();

  calMonthLabel.textContent = `${NAZWY_MIESIECY[widokMiesiac]} ${widokRok}`;
  calDays.innerHTML = '';

  const pierwszyDzien = new Date(widokRok, widokMiesiac, 1);
  const liczbaDni = new Date(widokRok, widokMiesiac + 1, 0).getDate();
  const pusteNaStart = (pierwszyDzien.getDay() + 6) % 7;

  for (let i = 0; i < pusteNaStart; i++) {
    const puste = document.createElement('span');
    puste.className = 'cal-day cal-empty';
    calDays.appendChild(puste);
  }

  for (let dz = 1; dz <= liczbaDni; dz++) {
    const data = new Date(widokRok, widokMiesiac, dz);
    const klucz = formatujDate(data);

    const komorka = document.createElement('button');
    komorka.type = 'button';
    komorka.className = 'cal-day';
    komorka.textContent = dz;

    const dzisiejszy = klucz === formatujDate(dzis);
    const przeszly = data < new Date(dzis.getFullYear(), dzis.getMonth(), dzis.getDate());
    const zaplacony = zaplaconeDni.has(klucz);
    const oczekujacy = oczekujaceDni.has(klucz);

    if (dzisiejszy) komorka.classList.add('cal-today');
    if (przeszly) komorka.classList.add('cal-past');
    if (zaplacony) komorka.classList.add('cal-busy');
    if (oczekujacy && !zaplacony) komorka.classList.add('cal-pending');

    if (!przeszly && !zaplacony && !oczekujacy) {
      komorka.addEventListener('click', () => {
        const poleDaty = document.querySelector('input[name="data"]');
        if (poleDaty) {
          poleDaty.value = klucz;
          document.querySelectorAll('.cal-day.cal-selected').forEach(el => el.classList.remove('cal-selected'));
          komorka.classList.add('cal-selected');
        }
      });
    } else {
      komorka.disabled = true;
    }

    calDays.appendChild(komorka);
  }
}

const calPrev = document.getElementById('cal-prev');
const calNext = document.getElementById('cal-next');

if (calDays && calPrev && calNext) {
  calPrev.addEventListener('click', () => {
    widokMiesiac--;
    if (widokMiesiac < 0) { widokMiesiac = 11; widokRok--; }
    rysujKalendarz();
  });

  calNext.addEventListener('click', () => {
    widokMiesiac++;
    if (widokMiesiac > 11) { widokMiesiac = 0; widokRok++; }
    rysujKalendarz();
  });

  rysujKalendarz();
}

// ===== FORMULARZ REZERWACJI =====
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
  const formStatus = document.getElementById('form-status');

  const dateInput = bookingForm.querySelector('input[name="data"]');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  bookingForm.addEventListener('submit', async event => {
    event.preventDefault();

    const dane = new FormData(bookingForm);
    const imie = dane.get('imie').trim();
    const email = dane.get('email').trim();
    const telefon = dane.get('telefon').trim();
    const dataImprezy = dane.get('data');
    const wiek = dane.get('wiek');
    const regulaminAkcept = bookingForm.querySelector('input[name="regulamin"]').checked;

    if (!imie || !email || !telefon || !dataImprezy) {
      formStatus.textContent = 'Wypełnij wszystkie pola i wybierz datę z kalendarza.';
      formStatus.className = 'form-status error';
      return;
    }
    if (!regulaminAkcept) {
      formStatus.textContent = 'Musisz zaakceptować regulamin.';
      formStatus.className = 'form-status error';
      return;
    }

    formStatus.textContent = 'Wysyłanie...';
    formStatus.className = 'form-status';

    if (!APPS_SCRIPT_URL) {
      const numerDemo = String(Math.floor(1000 + Math.random() * 9000));
      const [r, m, d] = dataImprezy.split('-');
      const dataPL = `${d}/${m}/${r}`;
      sessionStorage.setItem('ostatniaRezerwacja', JSON.stringify({
        numer: numerDemo,
        dataPL: dataPL,
        kwota: wiek === 'nie' ? '800 zł' : '400 zł'
      }));
      window.location.href = 'rezerwacja-potwierdzenie.html';
      return;
    }

    try {
      const odpowiedz = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          imie: imie,
          email: email,
          telefon: telefon,
          data: dataImprezy,
          wiek: wiek,
          rodzaj: dane.get('rodzaj'),
          wiadomosc: dane.get('wiadomosc')
        })
      });

      const wynik = await odpowiedz.json();

      if (wynik.ok) {
        sessionStorage.setItem('ostatniaRezerwacja', JSON.stringify({
          numer: wynik.numer,
          dataPL: wynik.dataPL,
          kwota: wynik.kwota
        }));
        window.location.href = 'rezerwacja-potwierdzenie.html';
      } else {
        throw new Error('Błąd serwera');
      }
    } catch (blad) {
      formStatus.textContent = 'Ups, nie udało się wysłać. Spróbuj ponownie albo zadzwoń: 667 436 655.';
      formStatus.className = 'form-status error';
    }
  });
}