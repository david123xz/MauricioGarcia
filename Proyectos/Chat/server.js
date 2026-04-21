// ============= SERVIDOR =============
const express = require('express');         // Importa Express
const app = express();                      // Crea la app
const PORT = 3000;                          // Puerto donde correrá el servidor
const mysql = require('mysql2');            // Importa MySQL
const jwt = require('jsonwebtoken');        // Importa JWT
const { v4: uuidv4 } = require('uuid');     // Importa uuid para generar IDs únicos
const bcrypt = require('bcrypt');           // Importa bcrypt para hashing de contraseñas

// RECIBIR DATOS DEL JS
app.use(express.json());

// Servir archivos estáticos (como HTML, CSS, JS)
app.use(express.static('public'));

// CONFIGURACION DE LA BASE DE DATOS
const connection = mysql.createPool({
  host: '127.0.0.1',
  user: 'davidAdmin',
  password: '123456',
  database: 'CHAT',
  waitForConnections: true,
  connectionLimit: 10,
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
connection.getConnection((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// CARGAR USUARIOS
app.get('/usuarios', authMiddleware, (req, res) => {
  const usuarioActualID = req.user.id;

  const sql = 'SELECT id, nombre, email, estado FROM usuarios WHERE id != ?';
  
  connection.query(sql, [usuarioActualID], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.status(200).json(results);
  });
});

// CARGAR MENSAJES
app.get('/mensajes/:id_destinatario', authMiddleware, (req, res) => {
  const id_usuario = req.user.id;
  const id_destinatario = req.params.id_destinatario;

  const sql = `
    SELECT * FROM mensajes
    WHERE (id_usuario = ? AND id_destinatario = ?) OR (id_usuario = ? AND id_destinatario = ?)
    ORDER BY fecha_envio ASC
  `;

  connection.query(sql, [id_usuario, id_destinatario, id_destinatario, id_usuario], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al obtener mensajes' });
    }

    res.status(200).json(results);
  });
});

// ENVIAR MENSAJES
app.post('/mensajes', authMiddleware, (req, res) => {
  const id = uuidv4();
  const id_usuario = req.user.id;
  const { id_destinatario, contenido } = req.body;

  const sql = `
    INSERT INTO mensajes (id, id_usuario, id_destinatario, contenido)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql, [id, id_usuario, id_destinatario, contenido], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al enviar mensaje" });
    }

    res.json({ message: "Mensaje enviado" });
  });
});

// REGISTRAR USUARIOS
app.post("/usuarios_registrados", async (req, res) => {
  const id = uuidv4();
  const { nombre, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO usuarios (id, nombre, email, password) VALUES (?,?,?,?)';

  connection.query(sql, [id, nombre, email, passwordHash], (err, results) => {
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
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ?';

  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error al iniciar sesión' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id

      },
      'SECRETO',
      { expiresIn: '1h' }
    );

    console.log('Usuario autenticado:', user.id);

    connection.query(
      "UPDATE usuarios SET estado = 'online' WHERE id = ?",
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
    "UPDATE usuarios SET estado = 'offline' WHERE id = ?",
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