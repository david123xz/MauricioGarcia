// Variables globales
let usuarioSeleccionado = null;

const contenedorMensajes = document.getElementById('contenedorMensajes');
const chatVacio = document.getElementById('chatVacio');

function mostrarChatVacio() {
  chatVacio.style.display = 'flex';
  contenedorMensajes.style.display = 'none';
  contenedorMensajes.innerHTML = '';
}

mostrarChatVacio();

// Funcion para cargar a los usuarios
async function cargarUsuarios() {
  const token = localStorage.getItem('token');

  console.log("TOKEN:", token);
  const res = await fetch('/usuarios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log("STATUS:", res.status);

  const data = await res.json();
  console.log("RESPUESTA:", data);

  if (!res.ok) {
    console.error("ERROR API:", data);
    return;
  }

  const usuarios = data;

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

    btn.addEventListener('click', () => {
      usuarioSeleccionado = user;

      document.getElementById('chatTitulo').textContent = `${user.nombre}`;

      chatVacio.style.display = 'none';
      contenedorMensajes.style.display = 'block';

      cargarMensajes(user.id);
    });

    lista.appendChild(btn);
  });
}

// Funcion para cargar los mensajes de cada usuario
async function cargarMensajes(idUsuario) {
  const token = localStorage.getItem('token');

  const res = await fetch(`/mensajes/${idUsuario}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const mensajes = await res.json();

  contenedorMensajes.innerHTML = '';

  mensajes.forEach(m => {
    const div = document.createElement('div');

    div.textContent = m.contenido;

    contenedorMensajes.appendChild(div);
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

// BOTON ENVIAR MENSAJE
const btnEnviar = document.getElementById('btnEnviar');
const inputMensaje = document.getElementById('inputMensaje');

btnEnviar.addEventListener('click', async () => {
  const mensaje = inputMensaje.value.trim();

  if (mensaje === "" || !usuarioSeleccionado) return;

  const token = localStorage.getItem('token');

  await fetch('/mensajes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id_destinatario: usuarioSeleccionado.id,
      contenido: mensaje
    })
  });

  const div = document.createElement('div');
  div.textContent = mensaje;

  contenedorMensajes.appendChild(div);

  inputMensaje.value = "";
});
