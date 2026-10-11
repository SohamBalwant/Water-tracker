# WaterSaathi — Comprehensive Test Plan & Verification Matrix

> **Author:** Person 3 (Tanker Operator Dashboard, Admin Interface, Simulated Movement & Testing)  
> **Target Release:** WaterSaathi MVP (Chhatrapati Sambhajinagar Demonstration)  
> **Status:** Fully Tested & Passing (141 Automated Assertions)

---

## 1. Overview & Objectives

This document establishes the official test plan for **WaterSaathi**, covering unit verification, domain business logic, operator dispatch workflows, real-time GPS telemetry simulation, administrative auditing, and the full 12-step end-to-end user journey.

The testing strategy verifies both:
1. **Self-Contained Client Execution:** Zero-backend browser testing via deterministic mock state (`mockApi.js`).
2. **Serverless Lambda & DynamoDB Handlers:** Automated Node.js integration tests against native endpoints without external test framework dependencies.

---

## 2. Test Environments

| Component | Execution Target | State Store |
| :--- | :--- | :--- |
| **Unit & Handler Integration** | Node.js v22.22.0 (`backend/tests/run-tests.js`) | In-Memory DynamoDB Emulator |
| **Frontend Web App** | Vite + React (`apps/web`) | Browser SessionStorage / LocalStore |
| **Local HTTP API** | Node.js native HTTP server (`backend/src/local-server.js`) | In-Memory DynamoDB Emulator |
| **Cloud Production** | AWS SAM (API Gateway + Lambda + DynamoDB) | Amazon DynamoDB Tables |

---

## 3. Test Suites & Coverage Matrix

### 3.1 Suite 1: Input Validation (`validation.test.js`)
- [x] **Coordinates Range:** Verifies latitude [-90, +90] and longitude [-180, +180]. Rejects non-numeric strings and out-of-bound coordinates.
- [x] **Quantity Bounds:** Enforces water request limits (minimum 100L, maximum 25,000L). Rejects negative and non-integer values.
- [x] **ISO Timestamps:** Enforces valid ISO-8601 UTC strings. Rejects garbage strings and numbers.
- [x] **Enums:** Enforces valid `WaterType`, `TankerStatus`, `LocationSource`, and `ShortageReportStatus`.

### 3.2 Suite 2: Transparent Pricing Engine (`pricing.test.js`)
- [x] **Deterministic Single Quotes:** Calculates `(quantity / 1000) * ratePer1000Litres`.
- [x] **Paise Persistence Conversion:** Verifies exact `inrToPaise` and `paiseToInr` rounding without float precision leaks.
- [x] **Demand Pooling Shared Quote:** Calculates individual household quote with transparent pooling efficiency discount. Preserves individual quantity identity.
- [x] **Price Anomaly Flagging:** Automatically flags rates below ₹150/1000L or above ₹2,000/1000L for review.

### 3.3 Suite 3: Lifecycle State Machine Transitions (`statusTransitions.test.js`)
- [x] **Allowed Booking Transitions:**
  - `OPEN` / `MATCHED` &rarr; `ACCEPTED` &rarr; `EN_ROUTE` &rarr; `DELIVERED`
  - `OPEN` / `MATCHED` / `ACCEPTED` &rarr; `CANCELLED`
- [x] **Illegal Transitions Blocked:**
  - `DELIVERED` &rarr; `OPEN` (Illegal)
  - `OPEN` &rarr; `DELIVERED` (Skipping `EN_ROUTE` blocked)
  - `CANCELLED` &rarr; `ACCEPTED` (Illegal)

### 3.4 Suite 4: Candidate Matching & Demand Pooling (`matching.test.js`)
- [x] **Available Tanker Ranking:** Ranks candidate tankers by proximity (Haversine), rate card, capacity fit, and freshness score.
- [x] **Proximity Threshold:** Enforces 7.5 km maximum distance between pooling participants.
- [x] **Delivery Window Alignment:** Enforces 120-minute maximum difference between delivery windows.
- [x] **Capacity Suitability:** Rejects tankers with insufficient remaining capacity for combined orders.
- [x] **Water Category Isolation:** Prevents pooling `DRINKING` utility with `NON_DRINKING` utility orders.

### 3.5 Suite 5: API Lambda Handlers & DB Concurrency (`apiHandlers.test.js`)
- [x] **Tanker Discovery:** `GET /tankers?lat=...&lng=...` returns HTTP 200 with CORS headers.
- [x] **Duplicate Submission Protection:** Validates `X-Idempotency-Key` header prevents duplicate request creation on retry.
- [x] **Single-Seat Capacity Reservation:** Validates conditional DynamoDB write prevents allocating the same tanker capacity twice concurrently.
- [x] **Request Lookup:** Returns HTTP 200 for valid ID, HTTP 404 for unknown ID.

### 3.6 Suite 6: Person 3 Operator, Telemetry, Admin & E2E (`person3.test.js`)
- [x] **Operator Acceptance:** Operator accepts eligible booking, status updates to `ACCEPTED`, and tanker capacity decrements.
- [x] **Offline Tanker Protection:** System rejects assignment of tankers in `OFFLINE` status with HTTP 409 Conflict.
- [x] **Operator Decline:** Operator declines booking with documented reason; requests return to open status.
- [x] **GPS Simulation Driver:** `TankerSimulationDriver` iterates waypoints, updates coordinates, computes speed and bearing heading, and flags telemetry as `SIMULATED`.
- [x] **Stale Telemetry Identification:** Flags tanker coordinates older than 4 hours as stale in admin fleet oversight.
- [x] **Admin Shortage Report Workflow:** Admin updates report status from `UNVERIFIED` &rarr; `UNDER_REVIEW` &rarr; `VERIFIED`.

---

## 4. End-to-End 12-Step Acceptance Scenario

This scenario tests the complete user journey across Resident, Operator, Simulation Driver, and Database layers:

| Step | Action | Expected Output | Verification Status |
| :--- | :--- | :--- | :--- |
| **1** | Open Resident portal at Cidco Sector N-5 (`19.8762, 75.3433`). | Tankers within range are discovered and rendered on Leaflet map. | **PASS** |
| **2** | Discover suitable tanker. | `Samarth Water Carrier 01` (5,000L, Non-Drinking, ₹500/1000L) displayed. | **PASS** |
| **3** | Submit water request for 2,000L. | Request created in `OPEN` status with transparent quote ₹1,000. | **PASS** |
| **4** | Evaluate demand pooling. | Compatible neighborhood order (`request-001`, 1,000L) detected; combined pool = 3,000L. | **PASS** |
| **5** | Confirm quote. | Candidate booking created in `MATCHED` status with shared efficiency quote. | **PASS** |
| **6** | Open Operator Dispatch dashboard. | Candidate booking appears in Operator queue under Pending tab. | **PASS** |
| **7** | Operator accepts booking. | Booking transitions to `ACCEPTED`; tanker available litres reserved. | **PASS** |
| **8** | Operator marks status `EN_ROUTE`. | Booking transitions to `EN_ROUTE`; active trip announcement banner appears. | **PASS** |
| **9** | Simulate tanker location update. | `demoDriver.js` emits new coordinates along route; updates persisted to backend. | **PASS** |
| **10** | Resident monitors tracking timeline. | Resident tracking updates to `EN_ROUTE` with recent timestamp. | **PASS** |
| **11** | Operator confirms delivery. | Booking marked `DELIVERED`; tanker status returns to `AVAILABLE`. | **PASS** |
| **12** | Verify persistence. | Database query verifies booking and requests remain in `DELIVERED` state. | **PASS** |

---

## 5. How to Run Automated Tests

### 5.1 Run Complete Backend & Person 3 Test Suite
```bash
cd backend
npm test
```
**Expected Output:**
```
====================================================
 WaterSaathi Test Suite (Person 2 Backend & Person 3 Operator/E2E)
====================================================

RUNNING: 1. Input Validation Tests...
  PASSED: 1. Input Validation Tests

RUNNING: 2. Pricing Engine & Currency Tests...
  PASSED: 2. Pricing Engine & Currency Tests

RUNNING: 3. Lifecycle State Transition Tests...
  PASSED: 3. Lifecycle State Transition Tests

RUNNING: 4. Candidate Matching & Pooling Tests...
  PASSED: 4. Candidate Matching & Pooling Tests

RUNNING: 5. API Lambda Handlers & DB Integration Tests...
  PASSED: 5. API Lambda Handlers & DB Integration Tests

RUNNING: 6. Person 3 Operator, Telemetry, Admin & 12-Step E2E Lifecycle Tests...
  PASSED: 6. Person 3 Operator, Telemetry, Admin & 12-Step E2E Lifecycle Tests

====================================================
 Test Execution Summary:
   Passed Assertions: 141
   Failed Assertions: 0
   Result: ALL TESTS PASSED
====================================================
```

### 5.2 Build & Validate Frontend Web Bundle
```bash
cd apps/web
npm run build
```
**Expected Output:**
```
✓ built in ~800ms
dist/index.html
dist/assets/index.css
dist/assets/index.js
```

### 5.3 Run Local HTTP API Server
```bash
cd backend
npm start
```
Runs native REST API on `http://localhost:3001` with auto-seeded demonstration records.

### 5.4 Run Web Application Dev Server
```bash
cd apps/web
npm run dev
```
Accessible at `http://localhost:5173`.

---

## 6. Manual Verification & Edge Cases

1. **Stale Location Warning:**
   - In Admin Console, filter by "Stale Locations Only".
   - Verify `Ajanta Water Express 05` is highlighted with `⚠️ STALE TELEMETRY` because its last update was > 24 hours ago.
2. **Pricing Transparency Audit:**
   - In Admin Console, inspect the Price Transparency tab.
   - Verify all baseline demo tankers fall within ₹150 &ndash; ₹2,000 / 1000L.
3. **Shortage Reports Review:**
   - Under Shortage Reports tab, click "Mark Under Review" and "Verify Deficit".
   - Verify status updates in real time and reflected across metrics.
4. **Offline Tanker Assignment Guard:**
   - Select an offline tanker and verify the operational status panel reflects its unavailable state.
