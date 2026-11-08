import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { checkDbConnection } from './services/store';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = createApp();

  // Test and log DB connection status
  await checkDbConnection();

  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available under http://localhost:${PORT}/api`);
    console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal API bootstrap error:', err);
  process.exit(1);
});

