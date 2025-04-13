const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // Usar la variable de entorno configurada en Render
  user: process.env.DB_USER,     // Usar la variable de entorno configurada en Render
  password: process.env.DB_PASSWORD,  // Usar la variable de entorno configurada en Render
  database: process.env.DB_NAME, // Usar la variable de entorno configurada en Render
  port: process.env.DB_PORT || 3306  // Si tienes un puerto específico, usa la variable de entorno o el valor por defecto
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado exitosamente a la base de datos');
  }
});

// ⚠️ Ruta para servir el index.html
const frontendPath = path.join(__dirname, '..', 'Frontend');
app.use(express.static(frontendPath));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Ruta de prueba
app.get('/api/prueba', (req, res) => {
  res.json({ mensaje: 'Ruta /api/prueba funcionando correctamente 🎉' });
});

// Ruta para obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
  const query = `
    SELECT 
      u.idUsuario,
      u.nombre, 
      u.apellido,
      u.pais,
      e.totalHorasJugadas,
      e.totalSesiones,
      e.progresoTotal,
      e.ultimaSesion,
      e.primerLoginDia,
      m.iq, m.hambre, m.aseo
    FROM Usuario u
    JOIN EstadisticasJugador e ON u.idUsuario = e.idUsuario
    JOIN Mascota m ON u.idMascota = m.idMascota;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para login
app.post('/api/login', (req, res) => {
  const { idUsuario } = req.body;

  const updateQuery = `
    UPDATE EstadisticasJugador 
    SET 
      ultimaSesion = NOW(),
      primerLoginDia = IF(primerLoginDia IS NULL, NOW(), primerLoginDia) 
    WHERE idUsuario = ?
  `;
  db.query(updateQuery, [idUsuario], (err, results) => {
    if (err) {
      console.error('❌ Error al actualizar la sesión:', err);
      res.status(500).json({ error: 'Error al registrar el login' });
    } else {
      res.json({ mensaje: 'Sesión actualizada correctamente' });
    }
  });
});

// 🛑 Ruta catch-all para SPA o rutas desconocidas (opcional pero recomendable)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
