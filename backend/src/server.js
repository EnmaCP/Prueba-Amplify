import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';
import { seedEvents } from './seed.js';
import { ensureTableExists } from './initTable.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde la app Expo / React Native
app.use(express.json());

// Log básico de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Ruta de comprobación de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend Festival Control con DynamoDB operativo' });
});

// Rutas de la API
app.use('/api/events', eventsRouter);

// Ruta para cargar datos de prueba fácilmente desde el navegador o Postman
app.post('/api/seed', async (req, res) => {
  try {
    await seedEvents();
    res.json({ message: 'Datos iniciales insertados en DynamoDB con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al ejecutar seed', details: err.message });
  }
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor backend escuchando en: http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   - GET    http://localhost:${PORT}/api/events`);
  console.log(`   - POST   http://localhost:${PORT}/api/events`);
  console.log(`   - GET    http://localhost:${PORT}/api/events/:id`);
  console.log(`   - PUT    http://localhost:${PORT}/api/events/:id`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/events/:id/status`);
  console.log(`   - DELETE http://localhost:${PORT}/api/events/:id`);
  console.log(`   - POST   http://localhost:${PORT}/api/seed`);
  console.log(`===============================================`);

  // Intentamos verificar la tabla si hay credenciales configuradas
  if (process.env.AWS_ACCESS_KEY_ID || process.env.DYNAMODB_ENDPOINT) {
    try {
      await ensureTableExists();
    } catch (e) {
      console.warn('⚠️ No se pudo conectar a DynamoDB en el arranque:', e.message);
    }
  } else {
    console.log('ℹ️ Recuerda configurar tus credenciales en el archivo .env de backend/');
  }
});

