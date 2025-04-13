const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión promise
const cors = require('cors');
const path = require('path');

// Configuración inicial
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL mejorada
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bit_chicks',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificación de conexión
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err);
  });

// Servir archivos estáticos
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Rutas API
app.get('/api/prueba', (req, res) => {
  res.json({ status: 'success', message: 'API funcionando' });
});

app.get('/api/estadisticas', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM EstadisticasJugador');
    res.json({ status: 'success', data: results });
  } catch (err) {
    console.error('Error en /api/estadisticas:', err);
    res.status(500).json({ status: 'error', message: 'Error en el servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { idUsuario } = req.body;
  
  if (!idUsuario) {
    return res.status(400).json({ status: 'error', message: 'idUsuario requerido' });
  }

  try {
    // Ejemplo de consulta - ajusta según tu esquema
    const [result] = await pool.query(
      'UPDATE EstadisticasJugador SET ultimo_login = NOW() WHERE id = ?',
      [idUsuario]
    );
    
    res.json({ status: 'success', affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Error en /api/login:', err);
    res.status(500).json({ status: 'error', message: 'Error al actualizar login' });
  }
});

// Manejo de rutas para SPA (debe ser la última ruta)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Inicio del servidor
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});

// Manejo de cierre
process.on('SIGTERM', () => {
  server.close(() => {
    pool.end();
    console.log('Servidor cerrado');
    process.exit(0);
  });
});