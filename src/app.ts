import express from 'express';

import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(env.apiBasePath, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
