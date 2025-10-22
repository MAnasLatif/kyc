# KYC Application with Shufti Pro

Complete TypeScript + Express + Prisma (SQLite) KYC verification system with GitHub Codespaces support.

## Features

✅ **Face + Document Verification** (ID Card, Passport, Driving License)  
✅ **Server-side Status Validation**  
✅ **Cost Safety Guards** (Max 10 production runs)  
✅ **Admin Override** for manual status updates  
✅ **Webhook Integration** with payload logging  
✅ **SQLite Database** with Prisma ORM  
✅ **GitHub Codespaces Ready**  
✅ **TypeScript** with full type safety

---

## 🚀 Quick Start (GitHub Codespaces)

### 1. Create Repository & Open Codespace

```bash
# On GitHub: Create new repository
# Then: Code → Create codespace on main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your Shufti Pro credentials
```

### 4. Initialize Database

```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Configure Public URL

1. Go to **Ports** tab in Codespaces
2. Make port **3000** visibility **Public**
3. Copy the public URL (e.g., `https://yourorg-repo-abc123-3000.app.github.dev`)
4. Update `.env`:
   ```
   KYC_WEBHOOK_URL=https://<YOUR_PUBLIC_URL>/kyc/webhook
   ```
5. **Send this webhook URL to your client** to approve in Shufti Pro console

---

## 📁 Project Structure

```
.
├── .devcontainer/
│   └── devcontainer.json          # Codespaces configuration
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── dev.db                     # SQLite database (auto-generated)
├── src/
│   ├── index.ts                   # Express server
│   ├── config.ts                  # Environment configuration
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── libs/
│   │   ├── shuftiClient.ts        # Shufti Pro API client
│   │   └── country.ts             # ISO2 → ISO3 converter
│   ├── services/
│   │   └── kyc.service.ts         # Business logic
│   ├── routes/
│   │   └── kyc.ts                 # API routes
│   └── utils/
│       └── rateLimit.ts           # Cost safety counter
├── .env                           # Environment variables (create from .env.example)
├── .env.example                   # Example environment file
├── package.json
├── tsconfig.json
└── README.md
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

### Create Session

```bash
curl -X POST https://YOUR_URL/kyc/session \
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
curl https://YOUR_URL/kyc/status/ref-309164
```

### Mock Webhook (for testing)

```bash
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
curl -X POST https://YOUR_URL/kyc/admin/override \
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

Opens browser at `http://localhost:5555` with GUI for database.

### Schema

- **User**: Stores user records
- **KycSession**: Tracks verification sessions (reference, status, iframeUrl)
- **KycWebhook**: Logs all webhook payloads

---

## 🔒 Cost Safety

- **MAX_IFRAME_RUNS**: Limits production runs per user (default: 10)
- Each Shufti Pro verification costs ~$1.5
- In-memory counter (for production, move to database)

---

## 📤 What to Send Your Client

```
Webhook URL to approve in Shufti Pro console:
https://<YOUR_PUBLIC_URL>/kyc/webhook

Test reference for validation:
ref-309164

Endpoints:
- POST /kyc/session        → Create session
- POST /kyc/webhook        → Receive callbacks
- GET  /kyc/status/:ref    → Server validation
- POST /kyc/admin/override → Manual override
```

---

## 🔧 Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run dev`            | Start development server with hot reload |
| `npm run build`          | Compile TypeScript to JavaScript         |
| `npm start`              | Run production build                     |
| `npm run prisma:studio`  | Open Prisma Studio GUI                   |
| `npm run prisma:migrate` | Run database migrations                  |

---

## 🌍 Environment Variables

| Variable            | Description                | Required           |
| ------------------- | -------------------------- | ------------------ |
| `SHUFTI_CLIENT_ID`  | Shufti Pro client ID       | ✅                 |
| `SHUFTI_SECRET_KEY` | Shufti Pro secret key      | ✅                 |
| `KYC_WEBHOOK_URL`   | Public webhook URL         | ✅                 |
| `KYC_REDIRECT_URL`  | Post-verification redirect | ❌                 |
| `MAX_IFRAME_RUNS`   | Max runs per user          | ❌ (default: 10)   |
| `PORT`              | Server port                | ❌ (default: 3000) |

---

## 🛠️ Local Development

```bash
# Clone repo
git clone <your-repo>
cd kyc

# Install
npm install

# Setup environment
cp .env.example .env
# Edit .env with credentials

# Database
npx prisma migrate dev

# Run
npm run dev
```

---

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use PostgreSQL/MySQL instead of SQLite:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Implement signature verification for webhooks
4. Move `RunsCounter` to database
5. Add authentication middleware
6. Enable HTTPS

---

## 📝 TODO (Hardening)

- [ ] Implement webhook signature verification (varies by Shufti account)
- [ ] Persist runs counter in database (currently in-memory)
- [ ] Add Jest tests for routes & services
- [ ] Expand ISO2→ISO3 country mapper
- [ ] Add retry mechanism for Shufti API calls
- [ ] Implement admin authentication
- [ ] Add rate limiting middleware

---

## 📄 License

ISC

---

## 🤝 Support

For issues or questions:

1. Check Shufti Pro documentation: https://api.shuftipro.com/
2. Review webhook payload structure
3. Ensure webhook domain is approved in Shufti console

---

**Built with ❤️ using TypeScript, Express, Prisma & GitHub Codespaces**
