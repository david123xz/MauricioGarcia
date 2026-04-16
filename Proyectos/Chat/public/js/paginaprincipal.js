async function cargarUsuarios() {
  const token = localStorage.getItem('token');
  const res = await fetch('/usuarios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const usuarios = await res.json();

  const lista = document.getElementById('listaUsuarios');
  lista.innerHTML = '';

  usuarios.forEach(user => {
    const btn = document.createElement('button');
    btn.textContent = `${user.nombre} (${user.estado})`;

    if (user.estado === 'online') {
      btn.style.color = 'green';
    } else {
      btn.style.color = 'grey';
    }

    lista.appendChild(btn);
  });
}

cargarUsuarios();

// ================= BOTONES =================
// BOTON CERRAR SESION
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
btnCerrarSesion.addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  
  await fetch('/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  localStorage.removeItem('token');
  window.location.href = '/html/login.html';
});