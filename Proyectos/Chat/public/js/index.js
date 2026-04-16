document.addEventListener("DOMContentLoaded", () => {
  // LOGIN (login.html)
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert('Error: ' + data.error);
          return;
        } else {
          console.log('Inicio de sesión exitoso:', data);
          localStorage.setItem('token', data.token);
          window.location.href = '/html/paginaprincipal.html';
        }
      })
      .catch(error => {
        console.error('Error al iniciar sesión:', error);
      });
    });
  }

  // INDEX (solo si existen botones)
  const registroBtn = document.getElementById('registroBtn');
  if (registroBtn) {
    registroBtn.addEventListener('click', () => {
      window.location.href = '/html/registro.html';
    });
  }

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/html/login.html';
    });
  }

});