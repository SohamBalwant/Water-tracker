# WaterSaathi — System Architecture

## Architecture Overview
WaterSaathi connects Indian residents, societies, schools, and small businesses facing water scarcity with tanker operators and community demand pooling.

```
+-----------------------------------------------------------------------------------+
|                              WaterSaathi Architecture                             |
+-----------------------------------------------------------------------------------+
|  [Person 1: Resident Web]         [Person 3: Operator Web]    [Person 3: Admin Web]|
|  - Leaflet Map (OSM tiles)        - Trip Queue                - Tanker Fleet       |
|  - Tanker Discovery               - Accept/Reject             - Verification Badge |
|  - Water Request Booking          - Status Transitions        - Shortage Reports   |
|  - Demand Pooling Flow            - GPS Simulation (Demo)     - Price Oversight    |
|  - Real-time Timeline Tracker     - Availability Toggle                            |
+-----------------------------------------------------------------------------------+
                                        | (REST JSON)
                                        v
+-----------------------------------------------------------------------------------+
|                     [Person 2: Backend API Gateway & Lambdas]                      |
|  - GET /tankers                 - POST /bookings/{id}/accept                      |
|  - POST /requests               - POST /bookings/{id}/status                      |
|  - GET /requests/{id}           - POST /tankers/{id}/location                     |
|  - POST /requests/{id}/pool     - POST /shortage-reports                          |
|  - GET /bookings                - GET /admin/shortage-reports                     |
+-----------------------------------------------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 | (Local Dev / CI)                            | (AWS Production)
                 v                                             v
+--------------------------------+            +---------------------------------+
| In-Memory Store & Test Runner  |            | Amazon DynamoDB Tables          |
| - Fast offline test coverage   |            | - WaterSaathi-Tankers           |
| - Zero external dependencies   |            | - WaterSaathi-Requests          |
|                                |            | - WaterSaathi-Bookings          |
|                                |            | - WaterSaathi-Reports           |
+--------------------------------+            +---------------------------------+
```

## Domain Model
- **Tanker:** Registered water supplier with capacity, rate, verification flag, water type, status, and latest coordinates.
- **Request:** Resident water order with location, quantity, delivery window, and quoted price.
- **Demand Pool:** Proximity and delivery-window matching algorithm that groups compatible neighborhood requests to share a tanker trip.
- **Booking:** Confirmed delivery contract tying one or more requests to a specific tanker.
- **Shortage Report:** Community-submitted crowd-sourced signal of water scarcity in a locality.

## Development & Deployment
- Frontend: React + Vite + standard CSS + Leaflet (hosted on AWS Amplify).
- Backend: AWS SAM, Node.js Lambda runtime, DynamoDB.
