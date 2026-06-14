import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./docs/swagger";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import routes from "./routes";
import clinicRoutes from "./routes/clinic.routes";
import staffRoutes from "./routes/staff.routes";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ALL API ROUTES HERE
app.use(env.apiBasePath, routes);

// docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/staff", staffRoutes);
app.use("/api/clinics", clinicRoutes);

// 404 + error
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;