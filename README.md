# WaterSaathi (जलसाथी) 💧
### Water-Tanker Discovery, Booking & Community Demand Pooling Platform for India

WaterSaathi helps Indian households, housing societies, schools, small businesses, and communities discover available water tankers, request water deliveries, coordinate shared orders through **community demand pooling**, and track trip fulfillment in real time.

Demonstration locality: **Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India**.

---

## 🚀 Core Platform Capabilities

1. **Nearby Tanker Discovery:** Discover nearby water tankers on an interactive Leaflet map with transparent capacities, pricing rates (₹/1,000L), water utility categories, and location freshness indicators.
2. **Community Demand Pooling:** Automatically matches neighboring households with overlapping delivery windows and compatible demands to combine multiple small orders into a single coordinated tanker delivery.
3. **Operator Dispatch Dashboard:** Gives tanker operators clear controls to accept/reject booking assignments, manage vehicle operational states (`AVAILABLE`, `BUSY`, `EN_ROUTE`, `OFFLINE`), and advance the delivery lifecycle.
4. **Simulated GPS Movement:** Features an swappable GPS telemetry engine (`demoDriver.js`) that simulates realistic vehicle movement across Sambhajinagar road networks, with heading and speed calculations.
5. **Administrative Auditing & Shortage Monitoring:** Enables municipal and community administrators to identify stale telemetry (> 4h), audit rate card anomalies against fair pricing benchmarks (₹150 – ₹2,000 / 1000L), and verify crowdsourced shortage alerts.
6. **Honesty & Truth in Communication:** Accurately labels simulated telemetry, clearly marks community reports as citizen submissions rather than municipal decrees, and avoids unsupported potability claims.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 6, Leaflet 1.9, Standard CSS Design System.
- **Backend:** AWS Lambda, Amazon API Gateway, Amazon DynamoDB, AWS SAM CLI.
- **Local Dev Support:** Native Node.js HTTP server (`backend/src/local-server.js`) with an in-memory DynamoDB client.
- **Testing:** Pure JavaScript automated testing runner with 141 passing assertions.

---

## 👥 Team Ownership & Modules

| Role | Module Ownership | Key Responsibilities |
| :--- | :--- | :--- |
| **PERSON 1** | `apps/web/src/pages/ResidentPage.jsx`<br>`apps/web/src/components/resident/` | Resident discovery map, request creation, pooling confirmation, tracking timeline. |
| **PERSON 2** | `backend/template.yaml`<br>`backend/src/` | Serverless API routes, DynamoDB schema, matching engine, transparent pricing, concurrency control. |
| **PERSON 3** | `apps/web/src/pages/OperatorPage.jsx`<br>`apps/web/src/pages/AdminPage.jsx`<br>`apps/web/src/components/operator/`<br>`apps/web/src/components/admin/`<br>`apps/web/src/services/demoDriver.js`<br>`docs/TEST_PLAN.md` | Operator dispatch console, admin audit tables, GPS simulation driver, shortage review, automated test suite. |

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- **Node.js** v18+ or v20+ or v22+
- **npm** v9+

### 2. Run Automated Test Suite (141 Assertions)
```bash
cd backend
npm test
```

### 3. Start Frontend Web Application
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

By default, the web app runs in self-contained **Mock Demo Mode** (`VITE_USE_MOCK_API=true`), persisting state to browser session storage so you can test complete end-to-end flows offline.

### 4. Optional: Run Local HTTP Backend Server
To connect the frontend to the local Node.js HTTP server:
```bash
# Terminal 1: Start backend REST API on port 3001
cd backend
npm start

# Terminal 2: Run frontend with mock mode disabled
cd apps/web
VITE_USE_MOCK_API=false npm run dev
```

### 5. Build Production Bundle
```bash
cd apps/web
npm run build
```

---

## 🧪 End-to-End Verification Flow

1. Open the **Resident** tab: select Cidco Sector N-5, submit a request for 2,000L.
2. The demand pooling engine finds a nearby compatible request (`request-001`, 1,000L) and presents a shared delivery offer.
3. Switch to **Operator Dispatch**: select Tanker 001, view the pending booking in the queue, and click **Accept Booking**.
4. Click **Start Delivery (Mark En Route)**.
5. In the **GPS Simulation** panel, click **Start Simulation** or **Single Step** to watch coordinates update in real time.
6. Switch back to the **Resident** tab to verify that the tracking timeline reflects `EN_ROUTE` with the latest timestamp.
7. Return to **Operator Dispatch** and click **Confirm Delivery Complete**.
8. Switch to **Admin Console** to inspect fleet capacity, review community shortage reports, and audit pricing compliance.

---

## 📖 Documentation
- [Comprehensive Test Plan (`docs/TEST_PLAN.md`)](docs/TEST_PLAN.md)
- [REST API Contract (`docs/API_CONTRACT.md`)](docs/API_CONTRACT.md)
- [Architecture & Data Models (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md)
