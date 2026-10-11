/**
 * WaterSaathi - Person 3 Automated Test Suite
 * 
 * Verifies Operator Workflows, GPS Simulation Telemetry,
 * Administrative Auditing, and End-to-End Lifecycle Integration.
 */

import { db } from '../src/shared/db.js';
import { seedDatabase } from '../../scripts/seed-demo-data.js';
import { TankerSimulationDriver, DEMO_ROUTES } from '../../apps/web/src/services/demoDriver.js';
import {
  TankerStatus,
  BookingStatus,
  RequestStatus,
  ShortageReportStatus,
  LocationSource,
} from '../../shared/types.js';

import { handler as tankerDiscovery } from '../src/tankers/discovery.js';
import { handler as requestCreate } from '../src/requests/create.js';
import { handler as requestGet } from '../src/requests/get.js';
import { handler as requestJoinPool } from '../src/requests/pool.js';
import { handler as bookingList } from '../src/bookings/list.js';
import { handler as bookingAccept } from '../src/bookings/accept.js';
import { handler as bookingReject } from '../src/bookings/reject.js';
import { handler as bookingStatus } from '../src/bookings/status.js';
import { handler as tankerLocation } from '../src/tankers/location.js';
import { handler as shortageReportList } from '../src/reports/list.js';
import { handler as shortageReportStatus } from '../src/reports/status.js';

function parse(res) {
  return {
    statusCode: res.statusCode,
    headers: res.headers || {},
    body: JSON.parse(res.body || '{}'),
  };
}

export async function runPerson3Tests(assert) {
  // Reset and seed database
  db.inMemory.reset();
  await seedDatabase(db);

  // =========================================================================
  // 1. Operator Booking Acceptance & Capacity Protection
  // =========================================================================
  {
    // A. Operator can accept an eligible booking
    // Create an eligible candidate booking
    const createdReq = parse(await requestCreate({
      httpMethod: 'POST',
      body: JSON.stringify({
        requesterId: 'res-p3-test',
        quantityLitres: 1500,
        latitude: 19.8762,
        longitude: 75.3433,
        deliveryWindowStart: '2026-10-10T14:30:00.000Z',
        waterType: 'NON_DRINKING',
      }),
    }));
    assert.strictEqual(createdReq.statusCode, 201, 'Request created for operator acceptance test');

    const poolRes = parse(await requestJoinPool({
      httpMethod: 'POST',
      pathParameters: { id: createdReq.body.requestId },
    }));
    assert.strictEqual(poolRes.statusCode, 200);
    assert.ok(poolRes.body.candidateBookingId, 'Candidate pool booking created');

    const acceptRes = parse(await bookingAccept({
      httpMethod: 'POST',
      pathParameters: { id: poolRes.body.candidateBookingId },
    }));
    assert.strictEqual(acceptRes.statusCode, 200, 'Operator successfully accepted eligible booking');
    assert.strictEqual(acceptRes.body.booking.status, BookingStatus.ACCEPTED);
    assert.ok(acceptRes.body.tanker.availableLitres < 5000, 'Tanker capacity decremented upon assignment');

    // B. Unavailable / Offline tanker cannot be assigned
    // Attempting to accept when tanker is OFFLINE should fail
    const offlineTankerBookingId = 'booking-offline-test';
    await db.put('WaterSaathi-Bookings', {
      bookingId: offlineTankerBookingId,
      tankerId: 'tanker-005', // seeded as OFFLINE
      status: BookingStatus.MATCHED,
      requestIds: ['request-001'],
      quotedPrice: 500,
    });

    const badAccept = parse(await bookingAccept({
      httpMethod: 'POST',
      pathParameters: { id: offlineTankerBookingId },
    }));
    assert.strictEqual(badAccept.statusCode, 409, 'Assigning an OFFLINE tanker must return 409 Conflict');
    assert.ok(badAccept.body.error?.code, 'Clear error code returned when tanker is unavailable');

    // C. Operator can reject an assigned booking with reason
    const rejectBookingId = 'booking-reject-test';
    await db.put('WaterSaathi-Bookings', {
      bookingId: rejectBookingId,
      tankerId: 'tanker-001',
      status: BookingStatus.OPEN,
      requestIds: ['request-002'],
      quotedPrice: 500,
    });

    const rejectRes = parse(await bookingReject({
      httpMethod: 'POST',
      pathParameters: { id: rejectBookingId },
      body: JSON.stringify({ reason: 'Depot pump maintenance delay' }),
    }));
    assert.strictEqual(rejectRes.statusCode, 200, 'Operator rejected booking');
    assert.strictEqual(rejectRes.body.status, BookingStatus.CANCELLED);
  }

  // =========================================================================
  // 2. Demo Movement Engine & GPS Telemetry Simulation
  // =========================================================================
  {
    const driver = new TankerSimulationDriver({
      tankerId: 'tanker-sim-001',
      route: DEMO_ROUTES.ROUTE_CIDCO_CENTRAL,
      updateIntervalMs: 100,
      stepsBetweenWaypoints: 2,
    });

    // Verify initial telemetry
    const initialPos = driver.getCurrentPosition();
    assert.strictEqual(initialPos.locationSource, LocationSource.SIMULATED, 'Telemetry correctly marked as SIMULATED');
    assert.strictEqual(initialPos.latitude, DEMO_ROUTES.ROUTE_CIDCO_CENTRAL[0].lat);
    assert.strictEqual(initialPos.longitude, DEMO_ROUTES.ROUTE_CIDCO_CENTRAL[0].lng);

    // Verify telemetry subscriber emission
    let emittedPos = null;
    const unsub = driver.subscribe(pos => {
      emittedPos = pos;
    });
    assert.ok(emittedPos !== null, 'Subscriber immediately receives current position');

    // Advance discrete step
    const step1 = await driver.step();
    assert.ok(step1.latitude !== 0 && step1.longitude !== 0, 'Step generates valid coordinates');
    assert.strictEqual(step1.speedKmph, 28, 'Simulated speed is recorded');
    assert.ok(step1.headingDeg >= 0 && step1.headingDeg <= 360, 'Heading bearing calculated in degrees');

    // Step 2 advances waypoint
    const step2 = await driver.step();
    assert.ok(step2.progressPercent > 0, 'Progress percentage increments along route');

    // Pause and Stop
    driver.pause();
    assert.strictEqual(driver.isRunning(), false, 'Driver paused correctly');

    driver.stop();
    const stoppedPos = driver.getCurrentPosition();
    assert.strictEqual(stoppedPos.latitude, DEMO_ROUTES.ROUTE_CIDCO_CENTRAL[0].lat, 'Stop resets to starting depot');
    assert.strictEqual(stoppedPos.speedKmph, 0, 'Stationary after stop');

    unsub();
  }

  // =========================================================================
  // 3. Stale Location Identification & Administrative Audits
  // =========================================================================
  {
    const allTankers = await db.scan('WaterSaathi-Tankers');
    const now = Date.now();

    // Identify stale tanker (tanker-005 seeded > 24 hours ago)
    const staleTankers = allTankers.filter(t => {
      const updateTime = new Date(t.lastLocationUpdate || 0).getTime();
      return (now - updateTime) > 4 * 60 * 60 * 1000;
    });
    assert.ok(staleTankers.length > 0, 'Stale tanker (> 4h old) accurately identified');
    assert.ok(staleTankers.some(t => t.tankerId === 'tanker-005'), 'tanker-005 correctly detected as stale');

    // Check pricing anomaly bounds (< 150 or > 2000)
    const suspiciousTankers = allTankers.filter(t => t.pricePer1000Litres < 150 || t.pricePer1000Litres > 2000);
    assert.strictEqual(suspiciousTankers.length, 0, 'Baseline demo fleet pricing is compliant');

    // Admin shortage report status update
    const reportsRes = parse(await shortageReportList({ httpMethod: 'GET' }));
    assert.strictEqual(reportsRes.statusCode, 200, 'Admin can list shortage reports');
    assert.ok(reportsRes.body.reports.length >= 3, 'Seeded shortage reports loaded');

    // Update report-001 status to UNDER_REVIEW, then VERIFIED
    const updateRep = parse(await shortageReportStatus({
      httpMethod: 'POST',
      pathParameters: { id: 'report-001' },
      body: JSON.stringify({ verificationStatus: ShortageReportStatus.UNDER_REVIEW }),
    }));
    assert.strictEqual(updateRep.statusCode, 200, 'Admin updated report status to UNDER_REVIEW');
    assert.strictEqual(updateRep.body.verificationStatus, ShortageReportStatus.UNDER_REVIEW);

    const verifyRep = parse(await shortageReportStatus({
      httpMethod: 'POST',
      pathParameters: { id: 'report-001' },
      body: JSON.stringify({ verificationStatus: ShortageReportStatus.VERIFIED }),
    }));
    assert.strictEqual(verifyRep.statusCode, 200, 'Admin verified report status');
    assert.strictEqual(verifyRep.body.verificationStatus, ShortageReportStatus.VERIFIED);
  }

  // =========================================================================
  // 4. Complete End-to-End Acceptance Test (12-Step Lifecycle)
  // =========================================================================
  {
    // Step 1: Resident discovers suitable tanker near Cidco Sector N-5
    const discoveryRes = parse(await tankerDiscovery({
      httpMethod: 'GET',
      queryStringParameters: { lat: '19.8762', lng: '75.3433' },
    }));
    assert.strictEqual(discoveryRes.statusCode, 200, 'Step 1: Resident discovers tankers');
    const availableTankers = discoveryRes.body.tankers.filter(t => t.status === TankerStatus.AVAILABLE);
    assert.ok(availableTankers.length > 0, 'Step 2: Found suitable available tanker');

    // Step 3: Resident creates water request
    const createRes = parse(await requestCreate({
      httpMethod: 'POST',
      body: JSON.stringify({
        requesterId: 'e2e-resident-user',
        locality: 'Cidco Sector N-5',
        quantityLitres: 2000,
        latitude: 19.8762,
        longitude: 75.3433,
        deliveryWindowStart: '2026-10-10T14:30:00.000Z',
        waterType: 'NON_DRINKING',
      }),
    }));
    assert.strictEqual(createRes.statusCode, 201, 'Step 3: Created water request');
    const e2eRequestId = createRes.body.requestId;

    // Step 4: Demand pooling opportunity evaluated
    const poolRes = parse(await requestJoinPool({
      httpMethod: 'POST',
      pathParameters: { id: e2eRequestId },
    }));
    assert.strictEqual(poolRes.statusCode, 200, 'Step 4: Evaluated pooling opportunity');
    assert.strictEqual(poolRes.body.eligible, true, 'Compatible pool matched with neighborhood request');
    const e2eBookingId = poolRes.body.candidateBookingId;

    // Step 5: Quoted price confirmed
    assert.ok(poolRes.body.quotedPrice > 0, 'Step 5: Authoritative quote generated');

    // Step 6: Operator retrieves bookings
    const bookingsList = parse(await bookingList({ httpMethod: 'GET' }));
    assert.strictEqual(bookingsList.statusCode, 200, 'Step 6: Operator lists bookings queue');
    const pendingBooking = bookingsList.body.bookings.find(b => b.bookingId === e2eBookingId);
    assert.ok(pendingBooking, 'Candidate booking present in operator queue');

    // Step 7: Operator accepts booking
    const acceptRes = parse(await bookingAccept({
      httpMethod: 'POST',
      pathParameters: { id: e2eBookingId },
    }));
    assert.strictEqual(acceptRes.statusCode, 200, 'Step 7: Operator accepted booking');
    assert.strictEqual(acceptRes.body.booking.status, BookingStatus.ACCEPTED);

    // Step 8: Update status to EN_ROUTE
    const enRouteRes = parse(await bookingStatus({
      httpMethod: 'POST',
      pathParameters: { id: e2eBookingId },
      body: JSON.stringify({ status: BookingStatus.EN_ROUTE }),
    }));
    assert.strictEqual(enRouteRes.statusCode, 200, 'Step 8: Booking marked EN_ROUTE');
    assert.strictEqual(enRouteRes.body.booking.status, BookingStatus.EN_ROUTE);

    // Step 9: Simulate tanker location update
    const locUpdateRes = parse(await tankerLocation({
      httpMethod: 'POST',
      pathParameters: { id: acceptRes.body.booking.tankerId },
      body: JSON.stringify({
        latitude: 19.8795,
        longitude: 75.3490,
        locationSource: LocationSource.SIMULATED,
      }),
    }));
    assert.strictEqual(locUpdateRes.statusCode, 200, 'Step 9: Simulated location update persisted');

    // Step 10: Resident lookup reflects updated status and recent timestamp
    const residentLookup = parse(await requestGet({
      httpMethod: 'GET',
      pathParameters: { id: e2eRequestId },
    }));
    assert.strictEqual(residentLookup.statusCode, 200, 'Step 10: Resident checks request state');
    assert.strictEqual(residentLookup.body.request.status, RequestStatus.EN_ROUTE, 'Resident sees EN_ROUTE state');

    // Step 11: Operator marks delivery complete
    const deliveredRes = parse(await bookingStatus({
      httpMethod: 'POST',
      pathParameters: { id: e2eBookingId },
      body: JSON.stringify({ status: BookingStatus.DELIVERED }),
    }));
    assert.strictEqual(deliveredRes.statusCode, 200, 'Step 11: Booking marked DELIVERED');
    assert.strictEqual(deliveredRes.body.booking.status, BookingStatus.DELIVERED);

    // Step 12: Verify persistent state after completion
    const finalBooking = await db.get('WaterSaathi-Bookings', { bookingId: e2eBookingId });
    assert.strictEqual(finalBooking.status, BookingStatus.DELIVERED, 'Step 12: Booking remains DELIVERED in database');
    const finalRequest = await db.get('WaterSaathi-Requests', { requestId: e2eRequestId });
    assert.strictEqual(finalRequest.status, RequestStatus.DELIVERED, 'Step 12: Request remains DELIVERED in database');
  }
}
