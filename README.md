# Pet.com.Unity Backend

Beginner-friendly Node.js + Express + TypeScript backend scaffold for the Pet.com.Unity diploma MVP.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- REST API
- In-memory mock repositories
- Ready for future Prisma/PostgreSQL or MongoDB integration

## Features

- Environment variable support with `dotenv`
- Clean structure with routes, controllers, services, and repositories
- Global error handling
- Not-found middleware
- Shared API response helpers
- Mock auth flow prepared for future JWT/database integration
- Mock CRUD for pets
- Mock endpoints for shelters and vets

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

If you are on Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The API will run by default on `http://localhost:5000/api`.

## Available Scripts

- `npm run dev` - starts the development server with file watching
- `npm run build` - compiles TypeScript into `dist/`
- `npm run start` - runs the compiled server
- `npm run lint` - checks for TypeScript issues

## Example Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Pets

- `GET /api/pets`
- `GET /api/pets/:id`
- `POST /api/pets`
- `PUT /api/pets/:id`
- `DELETE /api/pets/:id`

### Shelters

- `GET /api/shelters`
- `GET /api/shelters/:id`
- `POST /api/shelters`

### Vets

- `GET /api/vets`
- `GET /api/vets/:id`
- `POST /api/vets`

## Notes

- This project intentionally uses in-memory mock data, so data resets whenever the server restarts.
- `TODO` comments mark the places where real database queries and JWT authentication can be added later.
