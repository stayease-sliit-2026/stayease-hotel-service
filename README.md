# StayEase Hotel Listing Service

Hotel Listing Service for the StayEase cloud-native hotel booking platform (SE4010 - Current Trends in Software Engineering).

## Service Responsibility

This microservice manages hotel and room inventory for the platform.

- Provides public listing and search endpoints for hotels and rooms
- Protects write operations with admin-only JWT verification via Auth Service
- Exposes room availability data used by Booking Service
- Maintains dedicated MongoDB collections (`hotels`, `rooms`) following database-per-service architecture

## Tech Stack

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT verification through external Auth Service
- OpenAPI documentation via Swagger UI
- Docker + Docker Compose
- GitHub Actions CI/CD + SonarCloud scan

## API Endpoints

Base URL: `http://localhost:5000`

### Health

- `GET /health` - service health check

### Hotels

- `GET /hotels` - list hotels with optional filters (`location`, `minRating`, `q`)
- `GET /hotels/:id` - get a single hotel
- `POST /hotels` - create hotel (admin)
- `PUT /hotels/:id` - update hotel (admin)
- `DELETE /hotels/:id` - delete hotel (admin)

### Rooms

- `GET /hotels/:id/rooms` - list rooms in a hotel (supports `isAvailable`, `type`)
- `POST /hotels/:id/rooms` - create room (admin)
- `PUT /hotels/:id/rooms/:roomId` - update room (admin)
- `DELETE /hotels/:id/rooms/:roomId` - delete room (admin)

OpenAPI docs: `GET /docs`

## Inter-Service Communication

- Calls Auth Service:
	- `GET /auth/verify` to validate bearer tokens for admin routes
- Called by Booking Service:
	- `GET /hotels/:id/rooms` for room availability and room metadata

## Security

- `helmet` for secure HTTP headers
- CORS restricted via `CORS_ORIGINS` environment variable
- Input validation using `express-validator`
- Admin access enforcement with external JWT verification (`requireAdmin` middleware)
- Environment secrets handled through `.env` (not committed)

## Environment Variables

Create `.env` using `.env.example`.

- `PORT` (default `5000`)
- `MONGO_URI` (MongoDB Atlas connection string)
- `AUTH_SERVICE_URL` (base URL of Auth Service)
- `CORS_ORIGINS` (comma-separated allowed origins)

## Local Development

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

Current test scope includes:

- Health endpoint test
- Auth admin middleware tests
- Hotel/room controller unit tests

## Docker

Build and run image:

```bash
docker build -t stayease-hotel-service .
docker run --env-file .env -p 5000:5000 stayease-hotel-service
```

Run with compose:

```bash
docker compose up --build
```

## CI/CD

Workflow file: `.github/workflows/ci.yml`

Pipeline stages:

1. Checkout repository
2. Install dependencies (`npm ci`)
3. Run tests (`npm test`)
4. SonarCloud static scan
5. Build Docker image
6. Push Docker image (when Docker Hub secrets are configured)

Required GitHub secrets:

- `SONAR_TOKEN`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Project Structure

```
src/
	config/        # DB connection
	controllers/   # Business logic
	middleware/    # Auth + error middleware
	models/        # Mongoose schemas
	routes/        # Route definitions
	utils/         # Validation helpers
test/            # Jest test suites
```

## Notes for Assignment Report

This service demonstrates:

- Microservice ownership and independent deployment
- Secure inter-service authentication via Auth Service
- REST API contract with OpenAPI
- Containerized delivery with CI/CD automation
