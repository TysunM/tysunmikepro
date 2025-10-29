import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './src/config.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import projectRoutes from './src/routes/projects.js';
import referralRoutes from './src/routes/referrals.js';
import adminRoutes from './src/routes/admin.js';
import chatbotRoutes from './src/routes/chatbot.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.baseUrl, credentials: true }));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Views (simple HTML, you can integrate with your existing site)
app.get('/', (_, res) => res.sendFile(process.cwd() + '/views/index.html'));
app.get('/login', (_, res) => res.sendFile(process.cwd() + '/views/login.html'));
app.get('/signup', (_, res) => res.sendFile(process.cwd() + '/views/signup.html'));
app.get('/dashboard', (_, res) => res.sendFile(process.cwd() + '/views/dashboard.html'));
app.get('/admin', (_, res) => res.sendFile(process.cwd() + '/views/admin.html'));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(process.cwd() + '/views/404.html');
});

app.listen(config.port, () => console.log(`Portal running on ${config.port}`));

