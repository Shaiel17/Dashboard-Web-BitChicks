const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'database-bitchicks-web.cwoorlsk0gxa.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'BitChicks24',
  database: 'BITCHICKS',
  port: 3306
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado exitosamente a la base de datos');
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando! Ruta raíz activa ✅');
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
      u.pais,  -- Agregado el país
      e.totalHorasJugadas,
      e.totalSesiones,
      e.progresoTotal,
      e.ultimaSesion,  -- Asegúrate de que esta columna esté incluida
      e.primerLoginDia,  -- Asegúrate de que esta columna esté incluida
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

// Ruta para registrar el login de un usuario (actualiza el primer login y última sesión)
app.post('/api/login', (req, res) => {
  const { idUsuario } = req.body;  // Suponiendo que el idUsuario se pasa en el cuerpo de la solicitud

  // Actualizamos el primer login del día si es la primera sesión
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

// Iniciar el servidor en Cloud9 (puerto 8080)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});