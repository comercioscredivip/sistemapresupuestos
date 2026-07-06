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
        g1: { 12: 13.78580, 18: 11.117700, 24: 9.919100 },
        g2: { 12: 13.75590, 18: 11.007337, 24: 9.829675 },
        g3: { 12: 12.15970, 18: 9.45570, 24: 8.18050 }
      }
    },
    comercio1: {
      password: '1234',
      nombre: 'Comercio 1',
      comercio: 'Comercio 1',
      grupos: {
        g1: { 12: 13.78580, 18: 11.117700, 24: 9.919100 },
        g2: { 12: 13.75590, 18: 11.007337, 24: 9.829675 },
        g3: { 12: 12.15970, 18: 9.45570, 24: 8.18050 }
      }
    },
    comercio2: {
      password: '9876',
      nombre: 'Comercio 2',
      comercio: 'Comercio 2',
      grupos: {
        g1: { 12: 15.32000, 18: 12.65457, 24: 11.45000 },
        g2: { 12: 13.75590, 18: 11.18366, 24: 10.04181 },
        g3: { 12: 12.68250, 18: 10.31098, 24: 8.76620 }
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

    // --- PRESUPUESTO FORM (CrediVip Simulator) ---
    var presupForm = document.getElementById('presupuestoForm');
    if (presupForm) {
      var subTitle = document.querySelector('.sub-title');
      var gruposActivos = userData.grupos;

      // Mostrar el comercio del usuario
      if (subTitle) subTitle.textContent = userData.comercio;

      // Si es admin, mostrar selector de comercio
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
          alert('Ingrese un monto válido');
          return;
        }

        var anio = document.getElementById('anio').value;
        var grupo = gruposActivos[anio];
        var html = '';
        for (var c in grupo) {
          var valor = (monto * grupo[c]) / 100;
          html += '<tr><td>' + c + '</td><td>$ ' + valor.toLocaleString('es-AR', { maximumFractionDigits: 0 }) + '</td></tr>';
        }
        document.getElementById('resultado').innerHTML = html;

        var select = document.getElementById('anio');
        var textoAnio = select.options[select.selectedIndex].text;
        var texto = 'Hola, quiero solicitar un crédito.%0A%0AAño: ' + textoAnio + '%0AMonto: $ ' + monto.toLocaleString('es-AR');
        document.getElementById('waLink').href = 'https://wa.me/5493625328026?text=' + texto;
      });
    }

    // --- FORMULARIO FORM ---
    var formularioForm = document.getElementById('formularioForm');
    if (formularioForm) {
      formularioForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var dni = document.getElementById('formDni').value.trim();
        var nombre = document.getElementById('formNombre').value.trim();
        var monto = parseFloat(document.getElementById('formMonto').value);
        var plan = document.getElementById('formPlan').value;
        var cuotas = document.getElementById('formCuotas').value;

        if (!dni || !nombre || isNaN(monto) || monto <= 0) {
          alert('Complete todos los campos correctamente.');
          return;
        }

        var texto = 'Hola, quiero solicitar un crédito.%0A%0A' +
                    'DNI: ' + dni + '%0A' +
                    'Nombre: ' + nombre + '%0A' +
                    'Monto: $ ' + monto.toLocaleString('es-AR') + '%0A' +
                    'Plan: ' + plan + '%0A' +
                    'Cuotas: ' + cuotas;

        window.open('https://wa.me/5493625328026?text=' + texto, '_blank');
      });
    }

    // logout
    document.getElementById('logoutBtn').addEventListener('click', function () {
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('userData');
      window.location.href = 'index.html';
    });
  }
})();
