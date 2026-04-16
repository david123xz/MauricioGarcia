// ============= SERVIDOR =============
const express = require('express');   // Importa Express
const app = express();                // Crea la app
const PORT = 3000;                    // Puerto donde correrá el servidor
const mysql = require('mysql2');      // Importa MySQL
const jwt = require('jsonwebtoken');  // Importa JWT
const { v4: uuidv4 } = require('uuid');


// RECIBIR DATOS DEL JS
app.use(express.json());

// Servir archivos estáticos (como HTML, CSS, JS)
app.use(express.static('public'));

// CONFIGURACION DE LA BASE DE DATOS
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'davidAdmin',
  password: '123456',
  database: 'CHAT',
});

// ============= JWT =============
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, 'SECRETO');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ============= ENDPOINTS =============
// BIENVENIDA
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

// CONEXION A LA BASE DE DATOS
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// CARGAR USUARIOS
app.get('/usuarios', authMiddleware, (req, res) => {
  const usuarioActualID = req.user.id;

  const sql = 'SELECT nombre, email, estado FROM usuarios WHERE id != ?';
  
  connection.query(sql, [usuarioActualID], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.status(200).json(results);
  });
});

// REGISTRAR USUARIOS
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

// LOGIN
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

    const token = jwt.sign(
      { id: user.id

      },
      'SECRETO',
      { expiresIn: '1h' }
    );

    console.log('Usuario autenticado:', user.id);

    connection.query(
      "UPDATE usuarios SET estado = 'online' WHERE ID = ?",
      [user.id]
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token: token,
      id: user.id,
      nombre: user.nombre
    });
  });
});

// LOGOUT
app.post("/logout", authMiddleware, (req, res) => {
  const userId = req.user.id;

  connection.query(
    "UPDATE usuarios SET estado = 'offline' WHERE ID = ?",
    [userId],
    (err) => {
      if (err) {
        console.error('Error al actualizar estado en la base de datos:', err);
        return res.status(500).json({ error: 'Error al cerrar sesión' });
      }

      console.log('Usuario desconectado:', userId);
      return res.status(200).json({ message: "Cierre de sesión exitoso" });
    }
  );
});

// ARRANCAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});