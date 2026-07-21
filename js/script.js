(function () {
  'use strict';

  // ===== BASE DE DATOS DE USUARIOS =====
  // Cada usuario tiene su propio juego de coeficientes
  var usuarios = {
    admin: {
      password: '1234',
      nombre: 'Admin',
      comercio: 'Administrador',
      grupos: {
        g1: { 6: 26.50000, 12: 13.78580, 18: 11.117700, 24: 9.919100 },
        g2: { 6: 23.50000, 12: 13.75590, 18: 11.007337, 24: 9.829675 },
        g3: { 6: 23.00000, 12: 12.15970, 18: 9.45570, 24: 8.18050 }
      }
    },
    comercio1: {
      password: '1234',
      nombre: 'Comercio 1',
      comercio: 'Comercio 1',
      grupos: {
        g1: { 6: 26.50000, 12: 13.78580, 18: 11.117700, 24: 9.919100 },
        g2: { 6: 23.50000, 12: 13.75590, 18: 11.007337, 24: 9.829675 },
        g3: { 6: 23.00000, 12: 12.15970, 18: 9.45570, 24: 8.18050 }
      }
    },
    comercio2: {
      password: '9876',
      nombre: 'Comercio 2',
      comercio: 'Comercio 2',
      grupos: {
        g1: { 6: 23.67000, 12: 15.32000, 18: 12.65457, 24: 11.45000 },
        g2: { 6: 23.50000, 12: 13.75590, 18: 11.18366, 24: 10.04181 },
        g3: { 6: 22.60000, 12: 12.68250, 18: 10.31098, 24: 8.76620 }
      }
    }
  };

  // --- LOGIN ---
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value.trim();
      var errorEl = document.getElementById('loginError');

      if (!username || !password) {
        errorEl.textContent = 'Ingrese usuario y contraseña.';
        return;
      }

      var userData = usuarios[username];
      if (userData && userData.password === password) {
        localStorage.setItem('loggedUser', username);
        localStorage.setItem('userData', JSON.stringify(userData));
        window.location.href = 'dashboard.html';
      } else {
        errorEl.textContent = 'Usuario o contraseña incorrectos.';
      }
    });
  }

  // --- DASHBOARD ---
  var isDashboard = window.location.pathname.indexOf('dashboard.html') !== -1;
  if (isDashboard) {
    var username = localStorage.getItem('loggedUser');
    var userData = JSON.parse(localStorage.getItem('userData'));
    if (!username || !userData) {
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('displayUser').textContent = userData.nombre;

    // sidebar navigation
    var navBtns = document.querySelectorAll('.nav-btn');
    var sections = document.querySelectorAll('.content-section');
    var sectionTitle = document.getElementById('sectionTitle');

    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.getAttribute('data-section');
        if (!section) return;

        navBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        sections.forEach(function (s) { s.classList.remove('active'); });
        var target = document.getElementById('section-' + section);
        if (target) target.classList.add('active');

        sectionTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);

        // close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
      });
    });

    // mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // --- PRESUPUESTO FORM (Unificado) ---
    var presupForm = document.getElementById('presupuestoForm');
    if (presupForm) {
      var subTitle = document.querySelector('.sub-title');
      var gruposActivos = userData.grupos;

      if (subTitle) subTitle.textContent = userData.comercio;

      var comercioGroup = document.getElementById('comercioGroup');
      var comercioSelect = document.getElementById('comercioSelect');
      if (username === 'admin') {
        comercioGroup.style.display = 'block';
        comercioSelect.addEventListener('change', function () {
          var key = comercioSelect.value;
          var data = usuarios[key];
          gruposActivos = data.grupos;
          if (subTitle) subTitle.textContent = data.comercio;
          document.getElementById('resultado').innerHTML = '';
        });
      }

      presupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var monto = parseFloat(document.getElementById('monto').value);
        if (isNaN(monto) || monto <= 0) {
          alert('Ingrese un monto válido.');
          return;
        }

        var anio = document.getElementById('anio').value;
        var grupo = gruposActivos[anio];
        var html = '';
        var idx = 0;
        for (var c in grupo) {
          var valor = (monto * grupo[c]) / 100;
          var checked = idx === 0 ? 'checked' : '';
          html += '<tr><td><input type="radio" name="cuota-radio" class="cuota-check" data-cuota="' + c + '" data-valor="' + valor.toFixed(2) + '" ' + checked + '></td><td>' + c + '</td><td>$ ' + valor.toLocaleString('es-AR', { maximumFractionDigits: 0 }) + '</td></tr>';
          idx++;
        }
        document.getElementById('resultado').innerHTML = html;
        actualizarWaLink();
      });

      document.getElementById('resultado').addEventListener('change', function (e) {
        if (e.target && e.target.classList.contains('cuota-check')) {
          actualizarWaLink();
        }
      });

      ['formDni', 'formNombre', 'formTelefono'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', function () {
          actualizarWaLink();
        });
      });
    }

    function actualizarWaLink() {
      var select = document.getElementById('anio');
      var textoAnio = select.options[select.selectedIndex].text;
      var monto = parseFloat(document.getElementById('monto').value);
      if (isNaN(monto) || monto <= 0) return;

      var dni = document.getElementById('formDni').value.trim();
      var nombre = document.getElementById('formNombre').value.trim();
      var telefono = document.getElementById('formTelefono').value.trim();

      var checked = document.querySelector('.cuota-check:checked');
      if (!checked) {
        document.getElementById('waLink').removeAttribute('href');
        return;
      }
      var cuotaText = checked.getAttribute('data-cuota') + ' ($ ' + parseFloat(checked.getAttribute('data-valor')).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ')';

      var texto = 'Hola, quiero solicitar un crédito.%0A%0A';
      if (dni) texto += 'DNI: ' + dni + '%0A';
      if (nombre) texto += 'Nombre: ' + nombre + '%0A';
      if (telefono) texto += 'Teléfono: ' + telefono + '%0A';
      texto += 'Monto del crédito: $ ' + monto.toLocaleString('es-AR') + '%0A' +
               'Plan: ' + textoAnio + '%0A' +
               'Cuotas: ' + cuotaText;

      document.getElementById('waLink').href = 'https://wa.me/5493625328026?text=' + texto;
    }

    // logout
    document.getElementById('logoutBtn').addEventListener('click', function () {
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('userData');
      window.location.href = 'index.html';
    });
  }
})();
