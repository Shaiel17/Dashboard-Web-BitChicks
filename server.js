const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado exitosamente a la base de datos');
  }
});

// Ruta para servir los archivos estáticos desde la carpeta 'public'
const frontendPath = path.join(__dirname, 'public'); // Ruta correcta para acceder a la carpeta 'public'
app.use(express.static(frontendPath)); // Sirve todos los archivos estáticos dentro de 'public'

// Ruta raíz para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html')); // Sirve el index.html desde la carpeta 'public'
});

// Rutas adicionales de la API
app.get('/api/prueba', (req, res) => {
  res.json({ mensaje: 'Ruta /api/prueba funcionando correctamente 🎉' });
});

app.get('/api/estadisticas', (req, res) => {
  const query = `SELECT ...`; // Tu consulta aquí
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/login', (req, res) => {
  const { idUsuario } = req.body;
  const updateQuery = `UPDATE EstadisticasJugador SET ...`; // Tu actualización aquí
  db.query(updateQuery, [idUsuario], (err, results) => {
    if (err) {
      console.error('❌ Error al actualizar la sesión:', err);
      res.status(500).json({ error: 'Error al registrar el login' });
    } else {
      res.json({ mensaje: 'Sesión actualizada correctamente' });
    }
  });
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html')); // Ruta para manejar cualquier otra petición y redirigir al index.html
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
