"# Alvant Backend API

A production-ready Express.js backend API for Alvant, fully configured for Vercel serverless deployment.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB instance (Atlas recommended)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd alvant_backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run locally**

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📋 Environment Variables

See `.env.example` for all required variables:

```
MONGODB_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@example.com
ADMIN_JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

## 📁 Project Structure

```
├── /api/              # Vercel serverless entry point
├── /config/           # Database configuration
├── /models/           # Mongoose schemas
├── /routes/           # API route handlers
├── /middleware/       # Authentication middleware
├── /scripts/          # Utility scripts
├── /utils/            # Utility functions (email, etc.)
├── app.js             # Express app setup
├── vercel.json        # Vercel deployment config
├── DEPLOYMENT.md      # Deployment guide
└── package.json       # Dependencies & scripts
```

## 🔌 API Endpoints

### Health & Status

- `GET /` - API information
- `GET /api/health` - Health check endpoint

### Contact Routes (`/api/contact`)

- `POST /` - Submit contact form
  - Required fields: `name`, `email`, `phone`, `message`, `categories`

### Register Routes (`/api/register`)

- `POST /` - Register interest
  - Required fields: `companyName`, `firstName`, `lastName`, `jobTitle`, `phone`, `email`, `industry`

### Admin Routes (`/api/admin`)

- `POST /request-otp` - Request OTP for login
  - Required: `email` (must match ADMIN_EMAIL)
- `POST /verify-otp` - Verify OTP and get JWT token
  - Required: `email`, `otp`
- `GET /contacts` - Get all contact submissions (requires auth)
- `GET /registrations` - Get all registrations (requires auth)
- `DELETE /contacts/:id` - Delete contact (requires auth)
- `DELETE /registrations/:id` - Delete registration (requires auth)

## 🔐 Authentication

Admin endpoints use JWT token authentication via OTP:

1. Request OTP: `POST /api/admin/request-otp` with admin email
2. Verify OTP: `POST /api/admin/verify-otp` with email and OTP
3. Use returned JWT in Authorization header: `Authorization: Bearer <token>`

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables in the Vercel dashboard.

## 🛠 Development

### Available Scripts

```bash
npm run start    # Start server (production mode)
npm run dev      # Start with nodemon (development mode)
npm run build    # Build script (no-op, Vercel compatible)
```

### Database Connection

- Uses Mongoose with optimized connection pooling for serverless
- Connections are cached for better performance
- Supports MongoDB Atlas recommended

### Email Configuration

Supports two email delivery modes:

1. **Gmail** (Simple) - Uses app password authentication
2. **Custom SMTP** - Configure for any mail service

## 🔍 Testing

### Test endpoints locally:

```bash
# Health check
curl http://localhost:5000/api/health

# Submit contact
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "message": "Hello",
    "categories": ["support"]
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGODB_URI` environment variable
- Check IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)
- Ensure network connectivity to cluster

### Email Not Sending

- Verify credentials in `.env`
- For Gmail: use app password, not account password
- Check email service provider limits

### CORS Errors

- Verify `CORS_ORIGIN` matches your frontend domain exactly
- Include protocol (http:// or https://)
- No trailing slashes

## 📚 Additional Resources

- [Vercel Node.js Deployment](https://vercel.com/docs/concepts/functions/serverless-functions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

## 📄 License

This project is proprietary software for Alvant.

