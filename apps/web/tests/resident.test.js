/**
 * WaterSaathi - Person 1 (Resident Experience) Automated Unit Test Suite
 * 
 * Verifies discovery logic, input validations, transparent pricing,
 * demand pooling matching rules, and booking contracts using Node.js assert.
 */

import assert from 'node:assert';
import { mockApi } from '../src/services/mockApi.js';
import { residentApi } from '../src/services/residentApi.js';

let passed = 0;
let failed = 0;

function wrapAssert(baseAssert) {
  const handler = {
    get(target, prop) {
      if (typeof target[prop] === 'function') {
        return (...args) => {
          try {
            target[prop](...args);
            passed++;
          } catch (err) {
            failed++;
            console.error(`  FAIL [${prop}]:`, err.message);
            throw err;
          }
        };
      }
      return target[prop];
    },
  };
  return new Proxy(baseAssert, handler);
}

const proxyAssert = wrapAssert(assert);

async function runResidentTests() {
  console.log('====================================================');
  console.log(' WaterSaathi Resident Experience Test Suite (Person 1)');
  console.log('====================================================\n');

  // Reset seed data
  residentApi.resetDemoData();

  // Test 1: Tanker Discovery & Distance Ranking
  console.log('TEST 1: Nearby Tanker Discovery & Status Filtering...');
  {
    const centerLat = 19.8762;
    const centerLng = 75.3433;
    const tankers = await residentApi.getNearbyTankers(centerLat, centerLng);

    proxyAssert.ok(Array.isArray(tankers), 'Returns array of tankers');
    proxyAssert.ok(tankers.length >= 4, 'Discovers at least 4 active tankers');

    // Offline tankers must be excluded from active discovery
    const hasOffline = tankers.some((t) => t.status === 'OFFLINE');
    proxyAssert.strictEqual(hasOffline, false, 'OFFLINE tankers are excluded from resident discovery');

    // Tankers must include required shared contract fields
    const first = tankers[0];
    proxyAssert.ok(first.tankerId, 'tankerId exists');
    proxyAssert.ok(first.displayName, 'displayName exists');
    proxyAssert.ok(first.pricePer1000Litres > 0, 'pricePer1000Litres is positive');
    proxyAssert.ok(first.capacityLitres >= first.availableLitres, 'Capacity is greater than or equal to available');
    proxyAssert.ok(first.waterType, 'waterType exists');
    proxyAssert.ok(first.verificationStatus, 'verificationStatus exists');
    proxyAssert.ok(typeof first.distanceKm === 'number', 'distanceKm is computed');

    // Closest tanker should be first
    proxyAssert.ok(tankers[0].distanceKm <= tankers[1].distanceKm, 'Tankers sorted ascending by proximity');
    console.log('  PASSED: Tanker discovery and sorting\n');
  }

  // Test 2: Request Creation & Quantity Validation
  console.log('TEST 2: Water Request Creation & Input Validations...');
  {
    // Negative quantity must be rejected
    await proxyAssert.rejects(
      async () => {
        await residentApi.submitWaterRequest({
          quantityLitres: -500,
          latitude: 19.8762,
          longitude: 75.3433,
        });
      },
      /Quantity must be between 100 and 25,000 litres/,
      'Rejects negative quantity'
    );

    // Below 100L must be rejected
    await proxyAssert.rejects(
      async () => {
        await residentApi.submitWaterRequest({
          quantityLitres: 50,
          latitude: 19.8762,
          longitude: 75.3433,
        });
      },
      /Quantity must be between 100 and 25,000 litres/,
      'Rejects quantity < 100L'
    );

    // Over 25,000L must be rejected
    await proxyAssert.rejects(
      async () => {
        await residentApi.submitWaterRequest({
          quantityLitres: 50000,
          latitude: 19.8762,
          longitude: 75.3433,
        });
      },
      /Quantity must be between 100 and 25,000 litres/,
      'Rejects quantity > 25000L'
    );

    // Valid request submission
    const newReq = await residentApi.submitWaterRequest({
      requesterId: 'resident-test-suite',
      quantityLitres: 2000,
      latitude: 19.8762,
      longitude: 75.3433,
      waterType: 'NON_DRINKING',
      deliveryWindowStart: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    });

    proxyAssert.ok(newReq.requestId, 'Assigned unique requestId');
    proxyAssert.strictEqual(newReq.status, 'OPEN', 'Initial status is OPEN');
    proxyAssert.strictEqual(newReq.quantityLitres, 2000, 'Quantity stored accurately');
    // Transparent pricing: 2000L @ ₹500/1000L benchmark = ₹1000
    proxyAssert.strictEqual(newReq.quotedPrice, 1000, 'Transparent quote calculated at ₹500/1000L');
    proxyAssert.strictEqual(newReq.quotedPricePaise, 100000, 'Integer paise stored accurately');
    console.log('  PASSED: Request validation and price quote\n');
  }

  // Test 3: Demand Pooling Eligibility
  console.log('TEST 3: Neighborhood Demand Pooling Matching Engine...');
  {
    // Create an order in Cidco Sector N-5 compatible with seeded request-001/request-002
    const poolCandidateReq = await residentApi.submitWaterRequest({
      requesterId: 'resident-pooling-tester',
      quantityLitres: 1000,
      latitude: 19.8762,
      longitude: 75.3433,
      waterType: 'NON_DRINKING',
      deliveryWindowStart: new Date().toISOString(),
    });

    const poolResult = await residentApi.joinOrCheckPool(poolCandidateReq.requestId);

    proxyAssert.strictEqual(poolResult.eligible, true, 'Compatible demand pool found');
    proxyAssert.ok(poolResult.candidateBookingId, 'Candidate booking ID returned');
    proxyAssert.ok(poolResult.combinedQuantityLitres >= 2000, 'Combined quantity is aggregated');
    proxyAssert.ok(poolResult.quotedPrice > 0, 'Individual quoted price generated');
    proxyAssert.ok(poolResult.savingsInr >= 0, 'Coordination discount computed');
    proxyAssert.strictEqual(poolResult.matchedRequestsCount, 2, '2 households matched in pool');
    console.log('  PASSED: Demand pooling matching\n');
  }

  // Test 4: Booking Lifecycle Progression & Freshness
  console.log('TEST 4: Booking Tracking & Location Freshness...');
  {
    const bookings = await residentApi.getResidentBookings();
    proxyAssert.ok(Array.isArray(bookings), 'Bookings returned as array');
    proxyAssert.ok(bookings.length > 0, 'Bookings exist');

    const firstBooking = bookings[0];
    proxyAssert.ok(firstBooking.bookingId, 'bookingId exists');
    proxyAssert.ok(firstBooking.status, 'status exists');
    proxyAssert.ok(Array.isArray(firstBooking.requestIds), 'requestIds preserved');
    console.log('  PASSED: Booking tracking\n');
  }

  console.log('====================================================');
  console.log(` Test Execution Summary:`);
  console.log(`   Passed Assertions: ${passed}`);
  console.log(`   Failed Assertions: ${failed}`);
  console.log(`   Result: ALL PERSON 1 TESTS PASSED`);
  console.log('====================================================\n');
}

runResidentTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
