/**
 * WaterSaathi - Demonstration Seed Data Script
 * 
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
    lastLocationUpdate: '2026-10-11T08:00:00.000Z',
    locationSource: LocationSource.SIMULATED,
    verificationStatus: VerificationStatus.VERIFIED,
  },
  {
    tankerId: 'tanker-002',
    operatorId: 'operator-002',
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
