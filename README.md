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
- `GET /api/vets/:vetid/staff`
- `GET /api/vets/:vetid/staff/:id`
- `DELETE /api/vets/:vetid/staff/:staffid`
- `POST /api/vets/:vetid/staff/:staffid`

## Clinics
GET    /api/vets
GET    /api/vets/:clinicId
POST   /api/vets
PATCH  /api/vets/:clinicId
DELETE /api/vets/:clinicId

## Staff
GET    /api/vets/:clinicId/staff
POST   /api/vets/:clinicId/staff
GET    /api/vets/:clinicId/staff/:staffId
PATCH  /api/vets/:clinicId/staff/:staffId
DELETE /api/vets/:clinicId/staff/:staffId

## Clients
GET    /api/vets/:clinicId/clients
POST   /api/vets/:clinicId/clients
GET    /api/vets/:clinicId/clients/:clientId
PATCH  /api/vets/:clinicId/clients/:clientId
DELETE /api/vets/:clinicId/clients/:clientId

## clinic's pets
GET    /api/vets/:clinicId/clients/:clientId/pets
POST   /api/vets/:clinicId/clients/:clientId/pets
GET    /api/vets/:clinicId/clients/:clientId/pets/:petId
PATCH  /api/vets/:clinicId/clients/:clientId/pets/:petId
DELETE /api/vets/:clinicId/clients/:clientId/pets/:petId

## Clinic's events
GET    /api/vets/:clinicId/events
POST   /api/vets/:clinicId/events
GET    /api/vets/:clinicId/events/:eventId
PATCH  /api/vets/:clinicId/events/:eventId
DELETE /api/vets/:clinicId/events/:eventId

## Events filtering examples
GET /api/vets/:clinicId/events?staffId=123
GET /api/vets/:clinicId/events?clientId=456
GET /api/vets/:clinicId/events?petId=789
GET /api/vets/:clinicId/events?from=2026-01-01&to=2026-01-31

## Clients filtering

GET /api/vets/:clinicId/clients?search=John
GET /api/vets/:clinicId/clients?page=1&limit=20

## Notes

- This project intentionally uses in-memory mock data, so data resets whenever the server restarts.
- `TODO` comments mark the places where real database queries and JWT authentication can be added later.
