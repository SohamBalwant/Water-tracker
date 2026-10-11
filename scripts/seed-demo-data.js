/**
 * WaterSaathi - Demonstration Seed Data Script
 * 
 * Generates realistic demonstration records for Chhatrapati Sambhajinagar (Aurangabad),
 * Maharashtra locality as simulated data.
 * 
 * Supports both programmatic seeding (used in tests and local-server)
 * and direct CLI execution.
 * Generates coherent fictional seed records situated in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra.
 * Adheres strictly to the shared contracts defined in shared/types.js.
 */

import {
  TankerStatus,
  WaterType,
  LocationSource,
  VerificationStatus,
  RequestStatus,
  BookingStatus,
  ShortageReportStatus,
} from '../shared/types.js';

export const DEMO_LOCALITY = 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra';
export const BASE_COORDINATES = {
  latitude: 19.8762,
  longitude: 75.3433,
};

export const DEMO_TANKERS = [
  {
    tankerId: 'tanker-001',
    operatorId: 'operator-001',
    displayName: 'Samarth Water Carrier 01',
export const demoTankers = [
  {
    tankerId: 'tanker-001',
    operatorId: 'operator-001',
    displayName: 'Shri Ganesh Water Suppliers - Tanker 01',
    capacityLitres: 5000,
    availableLitres: 5000,
    pricePer1000Litres: 500,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.AVAILABLE,
    latitude: 19.8762,
    longitude: 75.3433,
    lastLocationUpdate: new Date().toISOString(),
    lastLocationUpdate: '2026-10-11T08:00:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    tankerId: 'tanker-002',
    operatorId: 'operator-002',
    displayName: 'Shree Jal Seva 02',
    capacityLitres: 6000,
    availableLitres: 6000,
    pricePer1000Litres: 650,
    waterType: WaterType.DRINKING,
    status: TankerStatus.AVAILABLE,
    latitude: 19.8820,
    longitude: 75.3510,
    lastLocationUpdate: new Date().toISOString(),
    displayName: 'Marathwada Jal Seva - Tanker 02',
    capacityLitres: 10000,
    availableLitres: 10000,
    pricePer1000Litres: 450,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.AVAILABLE,
    latitude: 19.8820,
    longitude: 75.3490,
    lastLocationUpdate: '2026-10-11T08:15:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    tankerId: 'tanker-003',
    operatorId: 'operator-003',
    displayName: 'Marathwada Bulkers 03',
    capacityLitres: 10000,
    availableLitres: 10000,
    pricePer1000Litres: 450,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.AVAILABLE,
    latitude: 19.8690,
    longitude: 75.3350,
    lastLocationUpdate: new Date().toISOString(),
    operatorId: 'operator-001',
    displayName: 'Panchavati Pure Water - Potable 03',
    capacityLitres: 4000,
    availableLitres: 4000,
    pricePer1000Litres: 650,
    waterType: WaterType.DRINKING,
    status: TankerStatus.AVAILABLE,
    latitude: 19.8740,
    longitude: 75.3380,
    lastLocationUpdate: '2026-10-11T08:20:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.UNVERIFIED,
  },
  {
    tankerId: 'tanker-004',
    operatorId: 'operator-001',
    displayName: 'Cidco Rapid Tanker 04',
    capacityLitres: 4000,
    availableLitres: 1000,
    pricePer1000Litres: 520,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.BUSY,
    latitude: 19.8730,
    longitude: 75.3480,
    lastLocationUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    operatorId: 'operator-003',
    displayName: 'Aurangabad Express Tanker 04',
    capacityLitres: 6000,
    availableLitres: 2000,
    pricePer1000Litres: 520,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.BUSY,
    latitude: 19.8690,
    longitude: 75.3520,
    lastLocationUpdate: '2026-10-11T07:45:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    tankerId: 'tanker-005',
    operatorId: 'operator-004',
    displayName: 'Ajanta Water Express 05',
    capacityLitres: 5000,
    availableLitres: 5000,
    pricePer1000Litres: 700,
    waterType: WaterType.DRINKING,
    status: TankerStatus.OFFLINE,
    latitude: 19.8850,
    longitude: 75.3390,
    lastLocationUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Stale: 24h ago
    displayName: 'Godavari Supply - En Route 05',
    capacityLitres: 8000,
    availableLitres: 8000,
    pricePer1000Litres: 480,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.EN_ROUTE,
    latitude: 19.8910,
    longitude: 75.3610,
    lastLocationUpdate: '2026-10-11T08:10:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.UNVERIFIED,
  },
  {
    tankerId: 'tanker-006',
    operatorId: 'operator-002',
    displayName: 'Paithan Road Express 06',
    capacityLitres: 8000,
    availableLitres: 3000,
    pricePer1000Litres: 480,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.EN_ROUTE,
    latitude: 19.8710,
    longitude: 75.3550,
    lastLocationUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.VERIFIED,
  },
];

export const DEMO_REQUESTS = [
  {
    requestId: 'request-001',
    requesterId: 'resident-demo-1',
    locality: 'Cidco Sector N-5',
    quantityLitres: 1000,
    latitude: 19.8780,
    longitude: 75.3440,
    deliveryWindowStart: '2026-10-10T14:30:00.000Z',
    waterType: WaterType.NON_DRINKING,
    status: RequestStatus.OPEN,
    quotedPrice: 500,
    createdAt: '2026-10-10T12:00:00.000Z',
    operatorId: 'operator-005',
    displayName: 'Krushna Tanker Services 06',
    capacityLitres: 5000,
    availableLitres: 0,
    pricePer1000Litres: 500,
    waterType: WaterType.NON_DRINKING,
    status: TankerStatus.OFFLINE,
    latitude: 19.8550,
    longitude: 75.3200,
    lastLocationUpdate: '2026-10-10T20:00:00.000Z',
    locationSource: LocationSource.MANUAL,
    verificationStatus: VerificationStatus.UNVERIFIED,
  },
];

export const demoRequests = [
  {
    requestId: 'request-001',
    requesterId: 'resident-demo-1',
    quantityLitres: 1000,
    latitude: 19.8765,
    longitude: 75.3438,
    deliveryWindowStart: '2026-10-10T14:00:00.000Z',
    status: RequestStatus.OPEN,
    waterType: WaterType.NON_DRINKING,
    quotedPrice: 500,
    quotedPricePaise: 50000,
    createdAt: '2026-10-10T13:00:00.000Z',
  },
  {
    requestId: 'request-002',
    requesterId: 'resident-demo-2',
    locality: 'Cidco Sector N-6',
    quantityLitres: 1000,
    latitude: 19.8770,
    longitude: 75.3450,
    deliveryWindowStart: '2026-10-10T14:45:00.000Z',
    waterType: WaterType.NON_DRINKING,
    status: RequestStatus.OPEN,
    quotedPrice: 500,
    createdAt: '2026-10-10T12:05:00.000Z',
    quantityLitres: 1000,
    latitude: 19.8770,
    longitude: 75.3440,
    deliveryWindowStart: '2026-10-10T14:30:00.000Z',
    status: RequestStatus.OPEN,
    waterType: WaterType.NON_DRINKING,
    quotedPrice: 500,
    quotedPricePaise: 50000,
    createdAt: '2026-10-10T13:15:00.000Z',
  },
  {
    requestId: 'request-003',
    requesterId: 'resident-demo-3',
    locality: 'Samarth Nagar West',
    quantityLitres: 3000,
    latitude: 19.8730,
    longitude: 75.3480,
    deliveryWindowStart: '2026-10-11T11:00:00.000Z',
    waterType: WaterType.NON_DRINKING,
    status: RequestStatus.ACCEPTED,
    quotedPrice: 1560,
    bookingId: 'booking-001',
    createdAt: '2026-10-11T07:15:00.000Z',
    quantityLitres: 3000,
    latitude: 19.8825,
    longitude: 75.3485,
    deliveryWindowStart: '2026-10-11T16:00:00.000Z',
    status: RequestStatus.OPEN,
    waterType: WaterType.NON_DRINKING,
    quotedPrice: 1350,
    quotedPricePaise: 135000,
    createdAt: '2026-10-11T09:00:00.000Z',
  },
  {
    requestId: 'request-004',
    requesterId: 'resident-demo-4',
    locality: 'Beed Bypass Colony A',
    quantityLitres: 2500,
    latitude: 19.8705,
    longitude: 75.3540,
    deliveryWindowStart: '2026-10-11T12:30:00.000Z',
    waterType: WaterType.NON_DRINKING,
    status: RequestStatus.EN_ROUTE,
    quotedPrice: 1200,
    bookingId: 'booking-002',
    createdAt: '2026-10-11T07:30:00.000Z',
    quantityLitres: 2000,
    latitude: 19.8745,
    longitude: 75.3375,
    deliveryWindowStart: '2026-10-11T17:00:00.000Z',
    status: RequestStatus.MATCHED,
    waterType: WaterType.DRINKING,
    quotedPrice: 1300,
    quotedPricePaise: 130000,
    createdAt: '2026-10-11T09:30:00.000Z',
  },
  {
    requestId: 'request-005',
    requesterId: 'resident-demo-5',
    locality: 'Beed Bypass Colony B',
    quantityLitres: 2500,
    latitude: 19.8715,
    longitude: 75.3560,
    deliveryWindowStart: '2026-10-11T12:30:00.000Z',
    waterType: WaterType.NON_DRINKING,
    status: RequestStatus.EN_ROUTE,
    quotedPrice: 1200,
    bookingId: 'booking-002',
    createdAt: '2026-10-11T07:35:00.000Z',
  },
];

export const DEMO_BOOKINGS = [
  {
    bookingId: 'booking-001',
    tankerId: 'tanker-004',
    requestIds: ['request-003'],
    quotedPrice: 1560,
    finalPrice: 1560,
    deliveryWindowStart: '2026-10-11T11:00:00.000Z',
    status: BookingStatus.ACCEPTED,
    createdAt: '2026-10-11T07:30:00.000Z',
    updatedAt: '2026-10-11T08:00:00.000Z',
  },
  {
    bookingId: 'booking-002',
    tankerId: 'tanker-006',
    requestIds: ['request-004', 'request-005'],
    quotedPrice: 2280,
    finalPrice: 2280,
    deliveryWindowStart: '2026-10-11T12:30:00.000Z',
    status: BookingStatus.EN_ROUTE,
    createdAt: '2026-10-11T07:45:00.000Z',
    updatedAt: '2026-10-11T08:15:00.000Z',
  },
];

export const DEMO_REPORTS = [
  {
    reportId: 'report-001',
    reporterId: 'resident-demo-2',
    locality: 'Cidco Sector N-4',
    latitude: 19.8745,
    longitude: 75.3412,
    description: 'Municipal pipeline pressure dropped to zero for 3 consecutive days.',
    reportedAt: '2026-10-10T09:00:00.000Z',
    verificationStatus: ShortageReportStatus.UNVERIFIED,
  },
  {
    reportId: 'report-002',
    reporterId: 'resident-demo-3',
    locality: 'Waluj MIDC Sector B',
    latitude: 19.8450,
    longitude: 75.2500,
    description: 'Society storage depleted. Ground water salinity too high for utility.',
    reportedAt: '2026-10-10T11:30:00.000Z',
    verificationStatus: ShortageReportStatus.UNDER_REVIEW,
  },
  {
    reportId: 'report-003',
    reporterId: 'resident-demo-4',
    locality: 'Samarth Nagar West',
    latitude: 19.8810,
    longitude: 75.3280,
    description: 'Water rationing in effect. Expected next supply in 48 hours.',
    reportedAt: '2026-10-11T06:15:00.000Z',
    verificationStatus: ShortageReportStatus.VERIFIED,
  },
];

/**
 * Seeds demonstration records into an active DynamoDbAdapter or in-memory DB.
 * @param {Object} dbClient 
 */
export async function seedDatabase(dbClient) {
  if (dbClient?.inMemory?.seed) {
    dbClient.inMemory.seed({
      tankers: DEMO_TANKERS,
      requests: DEMO_REQUESTS,
      bookings: DEMO_BOOKINGS,
      reports: DEMO_REPORTS,
    quantityLitres: 4000,
    latitude: 19.8695,
    longitude: 75.3515,
    deliveryWindowStart: '2026-10-11T11:00:00.000Z',
    status: RequestStatus.ACCEPTED,
    waterType: WaterType.NON_DRINKING,
    quotedPrice: 2080,
    quotedPricePaise: 208000,
    createdAt: '2026-10-11T07:00:00.000Z',
  },
];

export const demoBookings = [
  {
    bookingId: 'booking-001',
    tankerId: 'tanker-004',
    requestIds: ['request-005'],
    quotedPrice: 2080,
    finalPrice: 2080,
    deliveryWindowStart: '2026-10-11T11:00:00.000Z',
    status: BookingStatus.ACCEPTED,
    createdAt: '2026-10-11T07:15:00.000Z',
    updatedAt: '2026-10-11T07:20:00.000Z',
  },
  {
    bookingId: 'booking-002',
    tankerId: 'tanker-005',
    requestIds: ['request-003'],
    quotedPrice: 1440,
    finalPrice: 1440,
    deliveryWindowStart: '2026-10-11T10:00:00.000Z',
    status: BookingStatus.EN_ROUTE,
    createdAt: '2026-10-11T06:30:00.000Z',
    updatedAt: '2026-10-11T08:10:00.000Z',
  },
];

export const demoShortageReports = [
  {
    reportId: 'report-001',
    reporterId: 'resident-cidco-1',
    locality: 'Cidco Sector N-4',
    latitude: 19.8755,
    longitude: 75.3420,
    description: 'Municipal pipeline pressure dropped to zero for 48 hours.',
    reportedAt: '2026-10-10T18:00:00.000Z',
    verificationStatus: ShortageReportStatus.UNDER_REVIEW,
  },
  {
    reportId: 'report-002',
    reporterId: 'resident-garkheda-2',
    locality: 'Garkheda Parisar',
    latitude: 19.8680,
    longitude: 75.3550,
    description: 'Groundwater well contaminated by muddy runoff.',
    reportedAt: '2026-10-11T06:30:00.000Z',
    verificationStatus: ShortageReportStatus.UNVERIFIED,
  },
];

/**
 * Seeds a given database client instance with demo records.
 * Supports both the in-memory store and DynamoDbAdapter.
 * @param {object} databaseClient
 */
export async function seedDatabase(databaseClient) {
  if (databaseClient?.inMemory?.seed) {
    databaseClient.inMemory.seed({
      tankers: demoTankers,
      requests: demoRequests,
      bookings: demoBookings,
      reports: demoShortageReports,
    });
    return;
  }

  const tankersTable = process.env.TANKERS_TABLE || 'WaterSaathi-Tankers';
  const requestsTable = process.env.REQUESTS_TABLE || 'WaterSaathi-Requests';
  const bookingsTable = process.env.BOOKINGS_TABLE || 'WaterSaathi-Bookings';
  const reportsTable = process.env.REPORTS_TABLE || 'WaterSaathi-Reports';

  for (const t of DEMO_TANKERS) {
    await dbClient.put(tankersTable, t);
  }
  for (const r of DEMO_REQUESTS) {
    await dbClient.put(requestsTable, r);
  }
  for (const b of DEMO_BOOKINGS) {
    await dbClient.put(bookingsTable, b);
  }
  for (const rp of DEMO_REPORTS) {
    await dbClient.put(reportsTable, rp);
  }
}

// Standalone execution support
if (process.argv[1]?.endsWith('seed-demo-data.js')) {
  import('../backend/src/shared/db.js').then(async ({ db }) => {
    console.log('Seeding WaterSaathi demonstration data...');
    await seedDatabase(db);
    console.log(`Successfully seeded:
  - ${DEMO_TANKERS.length} Tankers
  - ${DEMO_REQUESTS.length} Water Requests
  - ${DEMO_BOOKINGS.length} Bookings
  - ${DEMO_REPORTS.length} Shortage Reports`);
  }).catch(err => {
    console.error('Failed to seed demonstration data:', err);
    process.exit(1);
  });
}
  const TANKERS_TABLE = process.env.TANKERS_TABLE || 'WaterSaathi-Tankers';
  const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'WaterSaathi-Requests';
  const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || 'WaterSaathi-Bookings';
  const REPORTS_TABLE = process.env.REPORTS_TABLE || 'WaterSaathi-Reports';

  for (const t of demoTankers) {
    await databaseClient.put(TANKERS_TABLE, t);
  }
  for (const r of demoRequests) {
    await databaseClient.put(REQUESTS_TABLE, r);
  }
  for (const b of demoBookings) {
    await databaseClient.put(BOOKINGS_TABLE, b);
  }
  for (const rp of demoShortageReports) {
    await databaseClient.put(REPORTS_TABLE, rp);
  }
}
