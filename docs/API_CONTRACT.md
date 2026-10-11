# WaterSaathi — Unified REST API Contract & Data Models

> **Specification Version:** 1.0.0  
> **Target Region:** AWS `ap-south-1` (Mumbai)  
> **Content-Type:** `application/json`

---

## 1. Shared Enums & Constants

### TankerStatus
- `AVAILABLE` &mdash; Ready to accept and fulfill water requests.
- `BUSY` &mdash; Loading at municipal water depot, borehole, or capacity reserved.
- `EN_ROUTE` &mdash; Actively in transit to fulfill an accepted booking.
- `OFFLINE` &mdash; Off-duty, undergoing maintenance, or depleted.

### WaterType
- `DRINKING` &mdash; Operator-declared drinking utility water. Not independent certification.
- `NON_DRINKING` &mdash; General utility water (cleaning, construction, sanitation).
- `UNKNOWN` &mdash; Unspecified category.

### LocationSource
- `GPS` &mdash; Real hardware telemetry or HTML5 native browser coordinates.
- `MANUAL` &mdash; Fixed depot address or operator-reported address.
- `SIMULATED` &mdash; Generated demonstration waypoint telemetry.

### VerificationStatus
- `VERIFIED` &mdash; Operator registered and identity documentation audited.
- `UNVERIFIED` &mdash; Initial self-registered listing without completed audit.

### RequestStatus & BookingStatus
- `OPEN` &mdash; Request submitted and awaiting matching or operator review.
- `MATCHED` &mdash; Compatible pooling candidate or assigned tanker paired.
- `ACCEPTED` &mdash; Operator confirmed assignment; tanker capacity reserved.
- `EN_ROUTE` &mdash; Vehicle dispatched and traveling to delivery location.
- `DELIVERED` &mdash; Fulfilled, confirmed, and water transferred.
- `CANCELLED` &mdash; Declined by operator or cancelled by resident.

### ShortageReportStatus
- `UNVERIFIED` &mdash; Newly filed citizen report.
- `UNDER_REVIEW` &mdash; Being investigated or cross-checked with municipal alerts.
- `VERIFIED` &mdash; Confirmed community deficit point.
- `REJECTED` &mdash; Found inaccurate, resolved, or duplicate.

---

## 2. API Endpoints

### 2.1 Tanker Discovery
- **Route:** `GET /tankers?lat={latitude}&lng={longitude}`
- **Query Parameters:**
  - `lat` (required, float): Resident latitude [-90, +90]
  - `lng` (required, float): Resident longitude [-180, +180]
- **Response (200 OK):**
# WaterSaathi — API Contract Documentation

## Overview
All endpoints communicate over JSON over HTTP, returning standard HTTP status codes and consistent error payloads:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable explanation"
  }
}
```

## Shared Monetary Units
- Persisted monetary figures: Integer paise (1 INR = 100 paise)
- Display figures: Standard INR (₹)
- Rates: Expressed in INR per 1,000 Litres

---

## Endpoints

### 1. Tanker Discovery
- **Method & Route:** `GET /tankers?lat={latitude}&lng={longitude}`
- **Description:** Returns candidate water tankers ranked by distance, capacity fit, and freshness. Excludes offline tankers.
- **Success Response (200):**
```json
{
  "tankers": [
    {
      "tankerId": "tanker-001",
      "operatorId": "operator-001",
      "displayName": "Samarth Water Carrier 01",
      "displayName": "Tanker 001",
      "capacityLitres": 5000,
      "availableLitres": 5000,
      "pricePer1000Litres": 500,
      "waterType": "NON_DRINKING",
      "status": "AVAILABLE",
      "latitude": 19.8762,
      "longitude": 75.3433,
      "lastLocationUpdate": "2026-10-11T08:00:00.000Z",
      "locationSource": "SIMULATED",
      "verificationStatus": "VERIFIED",
      "distanceKm": 0.15
    }
  ]
}
```

---

### 2.2 Create Water Request
- **Route:** `POST /requests`
- **Headers:**
  - `X-Idempotency-Key` (optional, string): Prevents duplicate request creation on network retry.
      "verificationStatus": "VERIFIED"
    }
  ]
}
```

### 2. Create Water Request
- **Method & Route:** `POST /requests`
- **Headers:** Optional `X-Idempotency-Key` for duplicate submission protection.
- **Request Body:**
```json
{
  "requesterId": "resident-demo",
  "quantityLitres": 2000,
  "latitude": 19.8762,
  "longitude": 75.3433,
  "deliveryWindowStart": "2026-10-11T12:00:00.000Z",
  "waterType": "NON_DRINKING"
}
```
- **Response (201 Created):**
```json
{
  "requestId": "req-1728639000-xyz",
  "deliveryWindowStart": "2026-10-11T10:00:00.000Z",
  "waterType": "NON_DRINKING"
}
```
- **Success Response (201):**
```json
{
  "requestId": "req-1728612345-abc1234",
  "requesterId": "resident-demo",
  "quantityLitres": 2000,
  "latitude": 19.8762,
  "longitude": 75.3433,
  "deliveryWindowStart": "2026-10-11T12:00:00.000Z",
  "waterType": "NON_DRINKING",
  "status": "OPEN",
  "quotedPrice": 1000,
  "createdAt": "2026-10-11T08:05:00.000Z"
}
```

---

### 2.3 Read Water Request
- **Route:** `GET /requests/{id}`
- **Response (200 OK):**
```json
{
  "request": {
    "requestId": "request-001",
    "requesterId": "resident-demo-1",
    "quantityLitres": 1000,
    "status": "OPEN",
    "quotedPrice": 500,
    "bookingId": null
  }
}
```

---

### 2.4 Evaluate & Join Demand Pool
- **Route:** `POST /requests/{id}/join-pool`
- **Response (200 OK - Eligible):**
```json
{
  "eligible": true,
  "candidateBookingId": "book-pool-001",
  "combinedQuantityLitres": 3000,
  "quotedPrice": 1425,
  "message": "A compatible shared delivery was found in your neighborhood."
}
```
- **Response (200 OK - Ineligible):**
```json
{
  "eligible": false,
  "candidateBookingId": null,
  "combinedQuantityLitres": null,
  "quotedPrice": null,
  "message": "No compatible nearby water requests currently open for pooling in your delivery window."
}
```

---

### 2.5 List Bookings
- **Route:** `GET /bookings`
- **Response (200 OK):**
  "deliveryWindowStart": "2026-10-11T10:00:00.000Z",
  "status": "OPEN",
  "quotedPrice": 1000,
  "quotedPricePaise": 100000,
  "createdAt": "2026-10-11T08:30:00.000Z"
}
```

### 3. Read Water Request
- **Method & Route:** `GET /requests/{id}`
- **Success Response (200):**
```json
{
  "request": {
    "requestId": "req-001",
    "requesterId": "resident-demo",
    "quantityLitres": 2000,
    "status": "OPEN",
    "quotedPrice": 1000
  },
  "booking": null
}
```

### 4. Join or Evaluate Demand Pool
- **Method & Route:** `POST /requests/{id}/join-pool`
- **Success Response (200):**
```json
{
  "eligible": true,
  "candidateBookingId": "book-1728612456-def5678",
  "candidateTankerId": "tanker-001",
  "combinedQuantityLitres": 3000,
  "quotedPrice": 950,
  "savingsInr": 50,
  "message": "A compatible shared delivery is available."
}
```

### 5. List Bookings
- **Method & Route:** `GET /bookings`
- **Success Response (200):**
```json
{
  "bookings": [
    {
      "bookingId": "booking-001",
      "tankerId": "tanker-004",
      "requestIds": ["request-003"],
      "quotedPrice": 1560,
      "finalPrice": 1560,
      "deliveryWindowStart": "2026-10-11T11:00:00.000Z",
      "status": "ACCEPTED",
      "createdAt": "2026-10-11T07:30:00.000Z",
      "updatedAt": "2026-10-11T08:00:00.000Z"
    }
  ]
}
```

---

### 2.6 Accept Booking Assignment
- **Route:** `POST /bookings/{id}/accept`
- **Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "bookingId": "booking-001",
    "status": "ACCEPTED"
  },
  "tanker": {
    "tankerId": "tanker-001",
    "availableLitres": 2500,
    "status": "AVAILABLE"
  }
}
```

---

### 2.7 Reject Booking Assignment
- **Route:** `POST /bookings/{id}/reject`
- **Request Body:**
```json
{
  "reason": "Depot pump maintenance delay"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "bookingId": "booking-001",
  "status": "CANCELLED",
  "message": "Booking declined. Associated requests released back to open status."
}
```

---

### 2.8 Update Booking Status
- **Route:** `POST /bookings/{id}/status`
- **Request Body:**
```json
{
  "status": "EN_ROUTE"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "bookingId": "booking-001",
    "status": "EN_ROUTE"
  }
}
```

---

### 2.9 Update Tanker Location Telemetry
- **Route:** `POST /tankers/{id}/location`
- **Request Body:**
```json
{
  "latitude": 19.8795,
  "longitude": 75.3490,
  "locationSource": "SIMULATED"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "tankerId": "tanker-001",
  "latitude": 19.8795,
  "longitude": 75.3490,
  "locationSource": "SIMULATED",
  "lastLocationUpdate": "2026-10-11T08:35:10.000Z"
}
```

---

### 2.10 Community Shortage Reports
- **Create:** `POST /shortage-reports`
  - Body: `{ "reporterId": "res-1", "locality": "Cidco Sector N-4", "latitude": 19.8745, "longitude": 75.3412, "description": "Borewell dry" }`
- **List (Admin):** `GET /admin/shortage-reports`
- **Update Status (Admin):** `POST /admin/shortage-reports/{id}/status`
  - Body: `{ "verificationStatus": "VERIFIED" }`
      "requestIds": ["request-005"],
      "quotedPrice": 2080,
      "finalPrice": 2080,
      "deliveryWindowStart": "2026-10-11T11:00:00.000Z",
      "status": "ACCEPTED",
      "createdAt": "2026-10-11T07:15:00.000Z",
      "updatedAt": "2026-10-11T07:20:00.000Z"
    }
  ]
}
```

### 6. Accept Booking
- **Method & Route:** `POST /bookings/{id}/accept`
- **Success Response (200):**
```json
{
  "message": "Booking accepted successfully.",
  "booking": { "bookingId": "booking-001", "status": "ACCEPTED" },
  "tanker": { "tankerId": "tanker-001", "availableLitres": 3000 }
}
```

### 7. Reject Booking
- **Method & Route:** `POST /bookings/{id}/reject`
- **Request Body (optional):** `{ "reason": "Operator unavailable" }`

### 8. Update Booking Status
- **Method & Route:** `POST /bookings/{id}/status`
- **Request Body:** `{ "status": "EN_ROUTE" }`
- **Allowed Transitions:**
  - `OPEN` -> `ACCEPTED` / `MATCHED` / `CANCELLED`
  - `MATCHED` -> `ACCEPTED` / `CANCELLED`
  - `ACCEPTED` -> `EN_ROUTE` / `CANCELLED`
  - `EN_ROUTE` -> `DELIVERED` / `CANCELLED`

### 9. Update Tanker Location
- **Method & Route:** `POST /tankers/{id}/location`
- **Request Body:**
```json
{
  "latitude": 19.8800,
  "longitude": 75.3500,
  "locationSource": "SIMULATED"
}
```

### 10. Community Shortage Reports
- **Method & Route:** `POST /shortage-reports`
- **Request Body:**
```json
{
  "reporterId": "resident-demo",
  "locality": "Cidco Sector N-5",
  "latitude": 19.8762,
  "longitude": 75.3433,
  "description": "Borewell dry for 4 days"
}
```

### 11. List Shortage Reports (Admin)
- **Method & Route:** `GET /admin/shortage-reports`
