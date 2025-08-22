# GeneCura Backend

A secure, role-based API for genetic drug response analysis built with Node.js, Express, and MongoDB.

## Features

- **Role-based Authentication**: JWT-based auth for Doctors, Geneticists, and Pharmacologists
- **CRUD Operations**: Complete data management for patients, genes, medicines, prescriptions, and reports
- **File Upload**: PDF report upload with validation
- **Audit Trail**: Complete change history for all entities
- **Treatment Analysis**: Cross-role data analysis with filtering and CSV export
- **Admin Panel**: Report approval workflow for heads/administrators
- **Security**: Rate limiting, input validation, CORS, and comprehensive logging

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env` and update the values:
   ```bash
   cp .env .env.local
   ```
   
   Key variables to configure:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Strong secret for JWT tokens
   - `FRONTEND_URL`: Your frontend URL for CORS

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Sign Up
```http
POST /auth/{role}/signup
```
Roles: `doctor`, `geneticist`, `pharmacologist`

Request body example:
```json
{
  "name": "Dr. John Smith",
  "email": "john@example.com",
  "password": "password123",
  "licence_id": "LIC001",
  "mobile_number": "+1234567890",
  "date_of_birth": "1980-01-15",
  "specialization": "Cardiology",
  "experience": 15,
  "hospital": "General Hospital"
}
```

#### Login
```http
POST /auth/{role}/login
```

Request body:
```json
{
  "user_id": "DOC001",
  "password": "password123"
}
```

#### Logout
```http
POST /auth/logout
```

#### Get Current User
```http
GET /auth/me
```

### Core Endpoints

#### Patients (Doctors only)
- `GET /patients` - List patients with pagination and search
- `GET /patients/:id` - Get single patient
- `POST /patients` - Create patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

#### Genes (Geneticists only)
- `GET /genes` - List genes
- `POST /genes` - Create gene
- `PUT /genes/:id` - Update gene
- `DELETE /genes/:id` - Delete gene
- `POST /genes/:id/metabolizers` - Add metabolizer detail
- `PUT /genes/metabolizers/:id` - Update metabolizer detail
- `DELETE /genes/metabolizers/:id` - Delete metabolizer detail

#### Medicines (Pharmacologists only)
- `GET /medicines` - List medicines
- `POST /medicines` - Create medicine
- `PUT /medicines/:id` - Update medicine
- `DELETE /medicines/:id` - Delete medicine
- `GET /medicines/:id/variation` - Get drug variation analysis

#### Prescriptions (Doctors only)
- `GET /prescriptions` - List prescriptions
- `POST /prescriptions` - Create prescription
- `PUT /prescriptions/:id` - Update prescription
- `DELETE /prescriptions/:id` - Delete prescription

#### Reports (All roles)
- `GET /reports` - List own reports
- `POST /reports` - Create report (with PDF upload)
- `PUT /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report

#### Treatment Cases (All roles)
- `GET /treatment-cases` - Treatment analysis with filtering
- `GET /treatment-cases?export=csv` - Export to CSV
- `POST /treatment-cases` - Create treatment case
- `PUT /treatment-cases/:id` - Update treatment case
- `DELETE /treatment-cases/:id` - Delete treatment case

#### Admin (Heads/Admin)
- `GET /admin/reports` - List all reports for review
- `POST /admin/reports/:id/decision` - Approve/reject report
- `GET /admin/stats` - Dashboard statistics

### Query Parameters

Most list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term
- Additional filters specific to each endpoint

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "data": {
    "patients": [...]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

## Sample Data

After running the seed script, you can use these credentials:

**Doctors:**
- DOC001 / password123
- DOC002 / password123

**Geneticist:**
- GEN001 / password123

**Pharmacologist:**
- PHARM001 / password123

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Configurable limits on endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Complete audit trail for all operations

## File Structure

```
backend/
├── models/          # Mongoose schemas
├── routes/          # Express route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── logs/            # Application logs
├── uploads/         # File uploads
└── server.js        # Main application file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection | localhost:27017/genecura |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRE` | JWT expiration | 15m |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `MAX_FILE_SIZE` | Max upload size | 20MB |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Seed database
npm run seed
```

## Deployment

1. Set environment variables
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

## API Testing

Use tools like Postman or curl to test the API. Remember to:
1. Sign up or use seeded credentials
2. Login to get authentication cookies
3. Use the cookies for subsequent requests

## Support

For issues or questions, refer to the project documentation or contact the development team.
