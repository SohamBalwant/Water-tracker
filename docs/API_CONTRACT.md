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
