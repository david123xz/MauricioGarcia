// Guardar datos del formulario
const formulario = document.getElementById('registroUsuarios');
formulario.addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviar datos al servidor
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            nombre, 
            email, 
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        } else {
            console.log('Usuario creado:', data);
        }
    })
    .catch(error => {
        console.error('Error al enviar datos al servidor:', error);
    });
});