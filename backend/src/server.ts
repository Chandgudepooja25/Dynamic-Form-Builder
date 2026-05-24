import 'dotenv/config';

import { createApp } from './app';
import { connectDB } from './config/db';
import { seedIfEmpty } from './config/seed';

async function main() {
  await connectDB();
  await seedIfEmpty();

  const port = Number(process.env.PORT ?? 4000);
  const app = createApp();
  app.listen(port, () => {
    console.log(`[api] ready on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('[api] fatal boot error', err);
  process.exit(1);
});
