// Wstawia teksty z content.json w miejsca [data-content],
// a zdjęcia w [data-image] (podmienia src obrazka)
fetch('content.json')
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