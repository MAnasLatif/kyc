# 🔐 KYC Verification System with Shufti Pro

A complete, production-ready KYC (Know Your Customer) verification system built with TypeScript, Express, Prisma, and Shufti Pro integration. Features real-time document and face verification with comprehensive webhook handling and admin controls.

> 🌐 **Live Demo:** [https://kyc.maldev.net](https://kyc.maldev.net)

## ✨ Features

- 🎭 **Face + Document Verification** - ID Card, Passport, Driving License support
- 🔍 **Server-side Status Validation** - Real-time verification status checks
- 💰 **Cost Safety Guards** - Configurable limits (default: 10 runs per user)
- 👨‍💼 **Admin Override** - Manual status updates for edge cases
- 🪝 **Webhook Integration** - Complete payload logging and processing
- 💾 **SQLite/Prisma** - Easy database management with migration support
- 🐳 **Docker Ready** - Containerized deployment included
- ☁️ **GitHub Codespaces** - One-click cloud development environment
- 🔒 **TypeScript** - Full type safety and IntelliSense support
- 🛡️ **Security First** - Helmet.js, CORS, rate limiting built-in

---

## 🌐 Live Demo

The application is currently deployed and accessible at:

**🔗 [https://kyc.maldev.net](https://kyc.maldev.net)**

### Try it Out

1. Visit the demo URL
2. Enter test user credentials
3. Experience the complete KYC verification flow
4. View real-time status updates

### API Endpoints (Production)

- **Base URL:** `https://kyc.maldev.net`
- **Health Check:** `https://kyc.maldev.net/health`
- **Demo Interface:** `https://kyc.maldev.net/`
- **Webhook:** `https://kyc.maldev.net/kyc/webhook`

> **Note:** The live instance is configured for demonstration purposes. For production use, please deploy your own instance.

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing-with-curl)
- [Production Guide](#-production-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

---

## � Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing-with-curl)
- [Production Guide](#-production-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Option 1: GitHub Codespaces (Recommended for Testing)

1. **Create Codespace**

   ```bash
   # On GitHub: Code → Create codespace on main
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your Shufti Pro credentials:
   # - SHUFTI_CLIENT_ID
   # - SHUFTI_SECRET_KEY
   ```

4. **Initialize Database**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start Server**

   ```bash
   npm run dev
   ```

6. **Configure Public Webhook**
   - Go to **Ports** tab in Codespaces
   - Set port **3000** visibility to **Public**
   - Copy the public URL (e.g., `https://yourorg-repo-abc123-3000.app.github.dev`)
   - Update `.env`: `KYC_WEBHOOK_URL=https://<YOUR_PUBLIC_URL>/kyc/webhook`
   - **Important:** Send this webhook URL to your client to approve in Shufti Pro console

### Option 2: Local Development

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd kyc
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Setup Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Initialize Database**

   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **For Webhook Testing**
   - Use [ngrok](https://ngrok.com/) to expose local server:
     ```bash
     ngrok http 3000
     ```
   - Update `.env` with ngrok URL + `/kyc/webhook`

### Option 3: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t kyc-app .
docker run -p 3000:3000 --env-file .env kyc-app
```

---

## 📁 Project Structure

```
kyc/
├── prisma/
│   ├── schema.prisma              # Database schema (User, KycSession, KycWebhook)
│   ├── dev.db                     # SQLite database (auto-generated)
│   └── migrations/                # Database migration history
│
├── src/
│   ├── index.ts                   # Express server entry point
│   ├── config.ts                  # Environment configuration loader
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   │
│   ├── libs/
│   │   ├── shuftiClient.ts        # Shufti Pro API client wrapper
│   │   └── country.ts             # ISO2 → ISO3 country code converter
│   │
│   ├── services/
│   │   └── kyc.service.ts         # Business logic layer
│   │
│   ├── routes/
│   │   └── kyc.ts                 # API route handlers
│   │
│   └── utils/
│       └── rateLimit.ts           # In-memory cost safety counter
│
├── .env.example                   # Example environment variables
├── .env                           # Your environment config (create this)
├── docker-compose.yml             # Docker Compose configuration
├── Dockerfile                     # Docker build instructions
├── demo.html                      # Test UI for verification flow
├── package.json                   # Node.js dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

### Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└─────┬───────┘
      │
      ↓
┌─────────────────────────────────────┐
│     Express Server (index.ts)       │
│  ┌───────────────────────────────┐  │
│  │  Routes (kyc.ts)              │  │
│  │  - POST /kyc/session          │  │
│  │  - POST /kyc/webhook          │  │
│  │  - GET  /kyc/status/:ref      │  │
│  └───────────┬───────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │  Service Layer                │  │
│  │  (kyc.service.ts)             │  │
│  └───────┬───────────────────────┘  │
│          ↓                           │
│  ┌───────────────┐  ┌────────────┐  │
│  │ Shufti Client │  │  Prisma    │  │
│  │ (API calls)   │  │  (SQLite)  │  │
│  └───────────────┘  └────────────┘  │
└─────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### 1. Health Check

```bash
GET /health
```

**Response:**

```json
{
  "ok": true,
  "timestamp": "2025-10-22T12:00:00.000Z",
  "env": "development"
}
```

---

### 2. Create/Get Session

```bash
POST /kyc/session
Content-Type: application/json

{
  "userId": "u_123",
  "email": "test@example.com",
  "locale": "en",
  "country": "PK"
}
```

**Response:**

```json
{
  "ok": true,
  "reference": "ref-1729598400000-abc123",
  "iframeUrl": "https://shuftipro.com/process/verify/...",
  "status": "pending",
  "runsCount": 1
}
```

**Note:** Use `iframeUrl` to embed verification flow in your frontend.

---

### 3. Webhook (Shufti Pro Callback)

```bash
POST /kyc/webhook
Content-Type: application/json

{
  "reference": "ref-1729598400000-abc123",
  "event": "verification.accepted",
  "response": {
    "verification_data": {
      "document": {
        "name": {
          "full_name": "Ali Raza"
        },
        "country": "PK"
      }
    }
  }
}
```

**Response:**

```json
{
  "ok": true
}
```

---

### 4. Server-side Status Check

```bash
GET /kyc/status/:reference
```

**Example:**

```bash
curl https://YOUR_URL/kyc/status/ref-309164
```

**Response:**

```json
{
  "success": true,
  "status_code": 200,
  "response": {
    "event": "verification.accepted",
    "reference": "ref-309164"
  }
}
```

---

### 5. Get Session Details

```bash
GET /kyc/session/:reference
```

**Response:**

```json
{
  "ok": true,
  "session": {
    "id": "...",
    "reference": "ref-309164",
    "status": "accepted",
    "iframeUrl": "...",
    "user": {
      "id": "u_123",
      "email": "test@example.com"
    }
  }
}
```

---

### 6. Get User Sessions

```bash
GET /kyc/user/:userId/sessions
```

**Response:**

```json
{
  "ok": true,
  "sessions": [
    {
      "reference": "ref-309164",
      "status": "accepted",
      "createdAt": "2025-10-22T12:00:00.000Z"
    }
  ]
}
```

---

### 7. Admin Override

```bash
POST /kyc/admin/override
Content-Type: application/json

{
  "reference": "ref-309164",
  "status": "accepted"
}
```

**Response:**

```json
{
  "ok": true
}
```

---

### 8. Debug: Extract Verification Data

```bash
POST /kyc/debug/extract
Content-Type: application/json

{
  "response": {
    "verification_data": {
      "document": {
        "name": {
          "full_name": "Ali Raza Khan"
        },
        "country": "PAK"
      }
    }
  }
}
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "first_name": "Ali",
    "last_name": "Raza Khan",
    "full_name": "Ali Raza Khan",
    "country": "PAK"
  }
}
```

---

## 🧪 Testing with cURL

### Health Check

```bash
# Test the live demo
curl https://kyc.maldev.net/health

# Or your local instance
curl http://localhost:3000/health
```

### Create Session

```bash
# Live demo
curl -X POST https://kyc.maldev.net/kyc/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "u_123",
    "email": "test@example.com",
    "locale": "en",
    "country": "PK"
  }'

# Local development
curl -X POST http://localhost:3000/kyc/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "u_123",
    "email": "test@example.com",
    "locale": "en",
    "country": "PK"
  }'
```

### Check Status (Server-side)

```bash
# Live demo (replace with actual reference)
curl https://kyc.maldev.net/kyc/status/ref-309164

# Local development
curl http://localhost:3000/kyc/status/ref-309164
```

### Mock Webhook (for testing)

```bash
# Replace YOUR_URL with your actual URL
curl -X POST https://YOUR_URL/kyc/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "ref-309164",
    "event": "verification.accepted",
    "response": {
      "verification_data": {
        "document": {
          "name": {"full_name": "Ali Raza"},
          "country": "PK"
        }
      }
    }
  }'
```

### Admin Override

```bash
# Live demo
curl -X POST https://kyc.maldev.net/kyc/admin/override \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "ref-309164",
    "status": "accepted"
  }'

# Local development
curl -X POST http://localhost:3000/kyc/admin/override \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "ref-309164",
    "status": "accepted"
  }'
```

---

## 💾 Database

### View Data (Prisma Studio)

```bash
npm run prisma:studio
```

Opens browser at `http://localhost:5555` with an interactive GUI for your database.

### Database Schema

The application uses three main tables:

#### **User**

Stores user information for verification tracking.

| Column      | Type     | Description                 |
| ----------- | -------- | --------------------------- |
| `id`        | String   | Unique user identifier (PK) |
| `email`     | String   | User email address (unique) |
| `createdAt` | DateTime | Account creation timestamp  |
| `updatedAt` | DateTime | Last update timestamp       |

#### **KycSession**

Tracks individual verification sessions.

| Column      | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `id`        | String   | Session ID (PK)                          |
| `reference` | String   | Shufti Pro reference (unique, indexed)   |
| `userId`    | String   | Foreign key to User                      |
| `status`    | String   | pending/accepted/declined/error          |
| `iframeUrl` | String?  | Shufti Pro verification iframe URL       |
| `locale`    | String?  | User's preferred language (en, ar, etc.) |
| `country`   | String?  | User's country code (ISO-2)              |
| `createdAt` | DateTime | Session creation time                    |
| `updatedAt` | DateTime | Last status update time                  |

#### **KycWebhook**

Logs all webhook callbacks from Shufti Pro for debugging and auditing.

| Column      | Type     | Description                       |
| ----------- | -------- | --------------------------------- |
| `id`        | String   | Webhook log ID (PK)               |
| `reference` | String   | Associated verification reference |
| `event`     | String   | Webhook event type                |
| `payload`   | Json     | Complete webhook payload          |
| `createdAt` | DateTime | When webhook was received         |

### Common Database Operations

```bash
# View all sessions
npm run prisma:studio
# Navigate to KycSession table

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name description_of_change

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client after schema update
npx prisma generate
```

### Querying the Database

You can also use Prisma Client directly in your code:

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all sessions for a user
const sessions = await prisma.kycSession.findMany({
  where: { userId: "u_123" },
  orderBy: { createdAt: "desc" },
});

// Get session by reference
const session = await prisma.kycSession.findUnique({
  where: { reference: "ref-309164" },
  include: { user: true },
});
```

---

## 🎨 Demo Interface

The project includes a ready-to-use demo HTML interface at `/demo.html`.

### Access the Demo

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. You'll see a simple UI to test the verification flow

### Features

- User ID and email input fields
- Country and locale selection
- One-click session creation
- Automatic iframe embedding
- Status checking functionality

### Using the Demo

1. Enter test user details
2. Click "Start KYC Verification"
3. Complete the verification in the embedded iframe
4. Check status using "Check Status" button

---

## 🔒 Cost Safety & Rate Limiting

### Built-in Protection

The application includes cost protection mechanisms to prevent unexpected charges:

- **MAX_IFRAME_RUNS**: Limits verification attempts per user (default: 10)
- **Per-user tracking**: Counts sessions per userId
- **In-memory counter**: Fast lookup (⚠️ resets on server restart)

### Cost Breakdown

| Service              | Approximate Cost | Notes                        |
| -------------------- | ---------------- | ---------------------------- |
| Shufti Pro - Basic   | ~$1.50 per check | Face + Document verification |
| Shufti Pro - Premium | ~$2.50 per check | Additional data points       |

### Production Recommendations

1. **Move counter to database** - Current implementation uses in-memory storage
2. **Add rate limiting** - Prevent abuse by IP address
3. **Implement daily caps** - Set organization-wide limits
4. **Add cost alerts** - Monitor spending via Shufti dashboard
5. **User authentication** - Require login before verification

### Configuring Limits

```bash
# In .env file
MAX_IFRAME_RUNS=10  # Maximum attempts per user

# For unlimited (⚠️ not recommended)
MAX_IFRAME_RUNS=999999
```

### Monitoring Usage

```typescript
// Check current runs for a user
const count = await kycService.getRunsCount("u_123");
console.log(`User has used ${count} out of ${MAX_IFRAME_RUNS} runs`);
```

---

## 📤 Integration Checklist for Shufti Pro

> **Production Instance:** This app is live at [https://kyc.maldev.net](https://kyc.maldev.net)

### What to Request from Your Client

Send this information to your client who manages the Shufti Pro account:

#### 1. Credentials Needed

```
Please provide:
1. Shufti Pro Client ID
2. Shufti Pro Secret Key
3. Account type (sandbox/production)
```

#### 2. Webhook Approval Request

```
Please approve this webhook URL in your Shufti Pro console:

Production Webhook URL: https://kyc.maldev.net/kyc/webhook
(Or use your own deployment URL: https://<YOUR_PUBLIC_URL>/kyc/webhook)

Method: POST
Content-Type: application/json

Steps to approve:
1. Log in to Shufti Pro console
2. Go to Settings → Webhooks
3. Add the above URL
4. Enable webhook notifications
```

#### 3. Configuration Settings

```
Recommended verification settings:
- Document Types: ID Card, Passport, Driver's License
- Face Verification: Enabled
- Address Verification: Optional
- Callback Mode: Webhook
- Allow Offline: No (for real-time verification)
```

### What to Send Your Frontend Team

```javascript
// API Base URL - Production
const API_BASE_URL = 'https://kyc.maldev.net';

// Or use your own deployment
// const API_BASE_URL = 'https://<YOUR_PUBLIC_URL>';

// Available Endpoints
POST   ${API_BASE_URL}/kyc/session           // Create verification session
GET    ${API_BASE_URL}/kyc/status/:reference // Check verification status
GET    ${API_BASE_URL}/kyc/session/:reference // Get session details
GET    ${API_BASE_URL}/kyc/user/:userId/sessions // Get user's sessions

// Example: Create Session
const response = await fetch(`${API_BASE_URL}/kyc/session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'unique_user_id',
    email: 'user@example.com',
    locale: 'en',
    country: 'US'
  })
});

const data = await response.json();
// Use data.iframeUrl to embed verification iframe
```

### Integration Testing Checklist

- [ ] Credentials configured in `.env`
- [ ] Webhook URL approved in Shufti console
- [ ] Server is publicly accessible (e.g., https://kyc.maldev.net)
- [ ] Test session creation works
- [ ] Webhook receives callbacks
- [ ] Status endpoint returns correct data
- [ ] User sessions are stored correctly
- [ ] Cost limits are functioning
- [ ] Demo interface works end-to-end

---

## � Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t kyc-verification:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name kyc-app \
  kyc-verification:latest

# View logs
docker logs -f kyc-app

# Stop container
docker stop kyc-app
docker rm kyc-app
```

### Docker Best Practices

- Use `.env` file for environment variables (never commit credentials)
- Mount a volume for SQLite persistence in production
- Use PostgreSQL/MySQL for production deployments
- Enable health checks in your orchestration tool

---

## �🔧 Available Scripts

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `npm run dev`             | Start development server with hot reload      |
| `npm run build`           | Compile TypeScript to JavaScript (→ dist/)    |
| `npm start`               | Run production build from dist/               |
| `npm run prisma:studio`   | Open Prisma Studio GUI at localhost:5555      |
| `npm run prisma:migrate`  | Create and run a new database migration       |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes |

---

## 🌍 Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

| Variable            | Description                        | Required | Default       |
| ------------------- | ---------------------------------- | -------- | ------------- |
| `SHUFTI_CLIENT_ID`  | Shufti Pro client ID               | ✅ Yes   | -             |
| `SHUFTI_SECRET_KEY` | Shufti Pro secret key              | ✅ Yes   | -             |
| `KYC_WEBHOOK_URL`   | Public webhook callback URL        | ✅ Yes   | -             |
| `KYC_REDIRECT_URL`  | User redirect after verification   | ❌ No    | -             |
| `MAX_IFRAME_RUNS`   | Maximum verification attempts/user | ❌ No    | `10`          |
| `PORT`              | Server port                        | ❌ No    | `3000`        |
| `NODE_ENV`          | Environment mode                   | ❌ No    | `development` |

**Example `.env` file:**

```bash
SHUFTI_CLIENT_ID=your_client_id_here
SHUFTI_SECRET_KEY=your_secret_key_here
KYC_WEBHOOK_URL=https://your-domain.com/kyc/webhook
KYC_REDIRECT_URL=https://your-domain.com/verification-complete
MAX_IFRAME_RUNS=10
PORT=3000
NODE_ENV=development
```

---

## � Production Deployment

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Switch from SQLite to PostgreSQL/MySQL
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up webhook signature verification
- [ ] Move `RunsCounter` to database (currently in-memory)
- [ ] Add authentication middleware for admin endpoints
- [ ] Set up logging and monitoring (e.g., Winston, Sentry)
- [ ] Configure CORS for specific domains
- [ ] Set up rate limiting per IP/user
- [ ] Enable database backups
- [ ] Review and adjust `MAX_IFRAME_RUNS` limit

### Database Migration for Production

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:

```bash
# Set your production database URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Deployment Platforms

#### Heroku

```bash
# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set SHUFTI_CLIENT_ID=xxx
heroku config:set SHUFTI_SECRET_KEY=xxx
heroku config:set KYC_WEBHOOK_URL=https://yourapp.herokuapp.com/kyc/webhook

# Deploy
git push heroku main
```

#### Railway / Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Auto-deploy on push to main

#### VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo> /var/www/kyc
cd /var/www/kyc
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name kyc-app
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/kyc
# Configure proxy_pass to localhost:3000
sudo ln -s /etc/nginx/sites-available/kyc /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Security Hardening

1. **Webhook Signature Verification**

   ```typescript
   // Add to webhook handler
   const signature = req.headers["x-shufti-signature"];
   const payload = JSON.stringify(req.body);
   const expectedSignature = crypto
     .createHmac("sha256", CONFIG.SECRET_KEY)
     .update(payload)
     .digest("hex");

   if (signature !== expectedSignature) {
     return res.status(401).json({ error: "Invalid signature" });
   }
   ```

2. **Authentication Middleware**

   ```typescript
   // Protect admin routes
   const adminAuth = (req, res, next) => {
     const token = req.headers.authorization?.split(" ")[1];
     // Verify JWT or API key
     if (!isValidToken(token)) {
       return res.status(403).json({ error: "Unauthorized" });
     }
     next();
   };
   ```

3. **Rate Limiting**

   ```typescript
   import rateLimit from "express-rate-limit";

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });

   app.use("/kyc", limiter);
   ```

---

## 🧪 Testing

### Unit Tests (TODO)

```bash
npm test
```

### Integration Testing

```bash
# Start test server
npm run dev

# Run test suite
npm run test:integration
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Webhook not receiving callbacks**

- Verify webhook URL is publicly accessible
- Check if URL is approved in Shufti Pro console
- Ensure port 3000 is exposed and public (Codespaces)
- Check firewall/security group settings

**2. Database connection errors**

```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

**3. "Max runs exceeded" error**

- Check `MAX_IFRAME_RUNS` in `.env`
- Review runs count: `npm run prisma:studio`
- For production, implement database-based counter

**4. CORS errors**

- Verify CORS configuration in `src/index.ts`
- Add your frontend domain to allowed origins

**5. TypeScript compilation errors**

```bash
# Clean build
rm -rf dist/
npm run build
```

### Debug Mode

Enable detailed logging:

```typescript
// Add to src/index.ts
app.use(morgan('dev')); // Already included

// Or set DEBUG env variable
DEBUG=* npm run dev
```

### Checking Webhook Logs

```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to KycWebhook table to see all webhook payloads
```

---

## 📝 Development Roadmap

### High Priority

- [ ] Implement webhook signature verification
- [ ] Add JWT authentication for admin endpoints
- [ ] Persist runs counter in database
- [ ] Add comprehensive test suite (Jest/Supertest)
- [ ] Set up CI/CD pipeline (GitHub Actions)

### Medium Priority

- [ ] Add logging infrastructure (Winston + file rotation)
- [ ] Expand ISO2→ISO3 country code mapper
- [ ] Implement retry mechanism for failed API calls
- [ ] Add email notifications for verification events
- [ ] Create admin dashboard UI

### Low Priority

- [ ] Multi-language support
- [ ] Analytics and reporting features
- [ ] Export verification reports (PDF)
- [ ] Bulk verification processing
- [ ] Integration with other identity providers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

ISC License - see LICENSE file for details

---

## 🤝 Support & Resources

### Shufti Pro Documentation

- [API Documentation](https://api.shuftipro.com/)
- [Integration Guide](https://docs.shuftipro.com/)
- [Webhook Events](https://docs.shuftipro.com/webhooks)

### Getting Help

1. Check [Troubleshooting](#-troubleshooting) section
2. Review webhook payload structure in Prisma Studio
3. Ensure webhook domain is approved in Shufti console
4. Check server logs for detailed error messages
5. Open an issue on GitHub with:
   - Steps to reproduce
   - Error messages/logs
   - Environment details

### Useful Links

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🏆 Acknowledgments

- Shufti Pro for identity verification services
- Prisma for excellent database tooling
- Express.js community
- GitHub Codespaces for seamless development

---

## 📊 Tech Stack

| Category         | Technology                      |
| ---------------- | ------------------------------- |
| Language         | TypeScript 5.3+                 |
| Runtime          | Node.js 20+                     |
| Framework        | Express.js 4.18+                |
| Database         | SQLite (dev), PostgreSQL (prod) |
| ORM              | Prisma 5.7+                     |
| Verification API | Shufti Pro                      |
| Security         | Helmet.js, CORS                 |
| Validation       | Zod                             |
| Logging          | Morgan                          |
| Development      | tsx, ts-node-dev                |
| Containerization | Docker, Docker Compose          |

---## ❤️ Thank You!

**Built with ❤️ using TypeScript, Express, Prisma & GitHub Codespaces**

_Last updated: October 2025_
