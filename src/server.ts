import app from './app';
import { env } from './config/env';
import { connectToDatabase } from './lib/mongoose';

async function startServer() {
  await connectToDatabase();

  app.listen(env.port, () => {
    console.log(
      `Server is running on http://localhost:${env.port}${env.apiBasePath}`,
    );
    console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
  });
}

startServer();
