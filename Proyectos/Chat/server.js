// server.js
const express = require('express'); // Importa Express
const app = express();              // Crea la app
const PORT = 3000;                  // Puerto donde correrá el servidor
const mysql = require('mysql2');    // Importa MySQL
const { v4: uuidv4 } = require('uuid');

// Recibir datos de JS
app.use(express.json());

// Servir archivos estáticos (como HTML, CSS, JS)
app.use(express.static('public'));

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'davidAdmin',
  password: '123456',
  database: 'CHAT',
});

// Pagian de bienvenida
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

// Comprobar conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Cargar usuarios
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT nombre, email, estado FROM usuarios';
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.status(200).json(results);
  });
});

app.post("/usuarios_registrados", (req, res) => {
  const id = uuidv4();
  const { nombre, email, password } = req.body;

  const sql = 'INSERT INTO usuarios (id, nombre, email, password) VALUES (?,?,?,?)';

  connection.query(sql, [id, nombre, email, password], (err, results) => {
    if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            error: "El email ya está registrado"
        });
        }

      console.error('Error al insertar datos en la base de datos:', err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    console.log('Usuario registrado con ID:', id);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      id: id
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al iniciar sesión' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0];
    console.log('Usuario autenticado:', user.id);

    connection.query("UPDATE usuarios SET estado = 'online' WHERE ID = ?",
      [user.id]
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      id: user.id,
      nombre: user.nombre
    });
  });
});

// Usuarios

// Arrancar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});