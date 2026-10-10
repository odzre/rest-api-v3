import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.routes.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { ensureAdmin } from './services/admin.service.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

ensureAdmin().catch((err) => console.error('[WARN] Gagal cek admin:', err.message));

export default app;
