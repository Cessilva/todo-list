const express = require('express');
const app = express();

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Configurar una ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola, Mundo!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});