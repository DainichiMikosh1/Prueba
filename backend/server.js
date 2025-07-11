import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import articulosRoutes from './routes/articulos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo_articulos')
.then(() => console.log('Conectado a MongoDB'))
.catch((error) => console.error('Error conectando a MongoDB:', error));

app.use('/api/articulos', articulosRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API del Catálogo de Artículos funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});