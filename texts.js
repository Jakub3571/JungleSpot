// Wczytuje teksty z pliku JSON wskazanego w atrybucie data-json
// (domyślnie content.json — strona główna).
(function () {
  var skrypt = document.querySelector('script[data-json]');
  var plik = (skrypt && skrypt.getAttribute('data-json')) || 'content.json';

  fetch(plik)
    .then(function (res) { return res.json(); })
    .then(function (tresci) {
      document.querySelectorAll('[data-content]').forEach(function (el) {
        var klucz = el.getAttribute('data-content');
        if (tresci[klucz] !== undefined) { el.innerHTML = tresci[klucz]; }
      });
      document.querySelectorAll('[data-image]').forEach(function (el) {
        var klucz = el.getAttribute('data-image');
        if (tresci[klucz] !== undefined && tresci[klucz] !== '') { el.src = tresci[klucz]; }
      });
    });
})();