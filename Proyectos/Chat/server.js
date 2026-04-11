// server.js
const express = require('express'); // Importa Express
const app = express();              // Crea la app
const PORT = 3000;                  // Puerto donde correrá el servidor
const mysql = require('mysql2');    // Importa MySQL
const { v4: uuidv4 } = require('uuid');

// Servir archivos estáticos (como HTML, CSS, JS)
app.use(express.static('public'));


// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'davidAdmin',
  password: '123456',
  database: 'CHAT',
});

// Comprobar conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Recibir datos de JS
app.use(express.json());

app.post("/register", (req, res) => {
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

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});