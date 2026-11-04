// Wstawia teksty z content.json w miejsca oznaczone atrybutem data-content
fetch('content.json')
  .then(function (res) { return res.json(); })
  .then(function (tresci) {
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var klucz = el.getAttribute('data-content');
      if (tresci[klucz] !== undefined) { el.innerHTML = tresci[klucz]; }
    });
  });