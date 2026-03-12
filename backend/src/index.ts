import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/km-lynx';

// Middlewares
app.use(cors());
app.use(express.json());

// Роуты
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import userRoutes from './routes/user.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import callRoutes from './routes/call.routes';
import scanRoutes from './routes/scan.routes';
import analyticsRoutes from './routes/analyticsRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/scan', scanRoutes); // Публичный роут для QR-сканирования
app.use('/api/analytics', analyticsRoutes);

// Базовый роут для проверки
app.get('/', (req, res) => {
  res.send('KM-Lynx API is running... 🚀');
});

// Подключение к MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
