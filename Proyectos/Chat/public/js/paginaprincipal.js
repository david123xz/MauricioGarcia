async function cargarUsuarios() {
  const res = await fetch('/usuarios');
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