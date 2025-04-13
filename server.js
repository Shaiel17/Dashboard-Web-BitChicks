const express = require('express');
const path = require('path');

const app = express();

// Servir los archivos estáticos desde la carpeta 'public'
const frontendPath = path.join(__dirname, 'public'); // Ruta correcta para acceder a la carpeta 'public'
app.use(express.static(frontendPath)); // Sirve todos los archivos estáticos dentro de 'public'

// Ruta raíz para servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html')); // Sirve el index.html desde la carpeta 'public'
});

// Inicia el servidor en el puerto 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
