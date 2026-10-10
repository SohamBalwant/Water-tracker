# WaterSaathi (जल साथी)

> Community water-tanker discovery, demand pooling, and transparent fulfillment platform for India.

WaterSaathi helps Indian households, housing societies, schools, small businesses, and communities discover available water tankers, request emergency deliveries, coordinate shared neighborhood orders (demand pooling), and track tanker dispatch with transparent rates and location freshness.

---

## 🏗️ Architecture & Team Responsibilities

WaterSaathi is built collaboratively by three engineering roles adhering to strict shared contracts:

- **PERSON 1 (Resident Experience):**
  - Branch: `feat/resident-experience`
  - Resident home page (`apps/web/src/pages/ResidentPage.jsx`)
  - Locality & GPS selection (`apps/web/src/components/resident/LocationBar.jsx`)
  - Leaflet interactive tanker map with status pins (`apps/web/src/components/resident/TankerMap.jsx`)
  - Supplier cards with transparent rates & verification status (`apps/web/src/components/resident/TankerCard.jsx`)
  - Tanker filtering and sorting (`apps/web/src/components/resident/TankerList.jsx`)
  - Water request modal & custom quantity picker (`apps/web/src/components/resident/WaterRequestModal.jsx`)
  - Community demand pooling coordination modal (`apps/web/src/components/resident/PoolingModal.jsx`)
  - 5-step live booking dispatch tracking timeline (`apps/web/src/components/resident/BookingTimeline.jsx`)
  - Unified resident API service (`apps/web/src/services/residentApi.js`)

- **PERSON 2 (Backend API & Matching Engine):**
  - Branch: `feat/backend-api`
  - AWS SAM template & Lambda functions (`backend/template.yaml`, `backend/src/`)
  - In-memory & DynamoDB persistence layer (`backend/src/shared/db.js`)
  - Demand pooling matching engine (`backend/src/shared/matching.js`)
  - Transparent pricing & paise conversion (`backend/src/shared/pricing.js`)
  - Local HTTP mock server (`backend/src/local-server.js`)
  - Backend test suite (`backend/tests/`)

- **PERSON 3 (Operator Dashboard & Simulated Movement):**
  - Branch: `feat/operator-admin`
  - Operator dashboard & accept/reject controls (`apps/web/src/pages/OperatorPage.jsx`)
  - Admin shortage reports and supplier oversight (`apps/web/src/pages/AdminPage.jsx`)
  - Simulated GPS movement driver (`apps/web/src/services/demoDriver.js`)

---

## 🚀 Quick Start

### 1. Run the Resident Web Application
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The app runs out of the box with the persistent mock client (`VITE_USE_MOCK_API=true`).

### 2. Run Person 1 Resident Test Suite
```bash
cd apps/web
npm test
```

### 3. Run Person 2 Backend Test Suite
```bash
node backend/tests/run-tests.js
```

### 4. Run Local API Server (Optional)
```bash
node backend/src/local-server.js
```
The server runs on `http://localhost:3001` and implements the complete API Gateway route spec.

---

## 📁 Repository Structure
```
watersaathi/
  apps/
    web/
      index.html
      package.json
      vite.config.js
      src/
        main.jsx
        App.jsx
        pages/
          ResidentPage.jsx
          OperatorPage.jsx
          AdminPage.jsx
        components/
          resident/
            LocationBar.jsx
            TankerMap.jsx
            TankerCard.jsx
            TankerList.jsx
            WaterRequestModal.jsx
            PoolingModal.jsx
            BookingTimeline.jsx
        services/
          residentApi.js
          apiClient.js
          mockApi.js
        data/
          mockTankers.js
          mockRequests.js
          mockBookings.js
        styles/
          global.css
          resident.css
      tests/
        resident.test.js
  backend/
    template.yaml
    package.json
    src/
    tests/
  shared/
    types.js
  docs/
    API_CONTRACT.md
    ARCHITECTURE.md
  scripts/
    seed-demo-data.js
  .env.example
  .gitignore
  README.md
```
