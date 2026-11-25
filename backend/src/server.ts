import http from 'node:http';
import { createApp } from './app.ts';
import { connectDB } from './config/db.ts';
import { env } from './config/env.ts';
import { initSocket } from './config/socket.ts';
import { seedDatabaseIfEmpty } from './utils/seedData.ts';

export async function createBackendServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  return { app, httpServer };
}

// Allow running backend standalone via `tsx backend/src/server.ts`
const isDirectExecution = process.argv[1]?.endsWith('backend/src/server.ts');
if (isDirectExecution) {
  createBackendServer()
    .then(({ httpServer }) => {
      httpServer.listen(env.port, '0.0.0.0', () => {
        console.log(`[Backend] Meridian API listening on http://localhost:${env.port}`);
      });
    })
    .catch((err) => {
      console.error('[Backend] Startup failed:', err);
      process.exit(1);
    });
}
