import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const bookingDuration = new Trend('booking_duration');

// Target: http://localhost:8080
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp up to 10 users
    { duration: '1m',  target: 10 },  // hold at 10 users
    { duration: '30s', target: 30 },  // spike to 30 users
    { duration: '30s', target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed:   ['rate<0.05'],  // fewer than 5% errors
    errors:            ['rate<0.05'],
  },
};

// Scenario 1: browse event list (read-heavy, public endpoint)
function browseEvents() {
  const res = http.get(`${BASE_URL}/api/events`, {
    tags: { name: 'GetEvents' },
  });

  const ok = check(res, {
    'events list: status 200': (r) => r.status === 200,
    'events list: response time < 300ms': (r) => r.timings.duration < 300,
  });
  errorRate.add(!ok);
}

// Scenario 2: fetch upcoming bookings for a user
function fetchUpcomingBookings() {
  const userId = 'test-user-id';
  const res = http.get(`${BASE_URL}/api/bookings/user/${userId}/upcoming`, {
    tags: { name: 'GetUpcomingBookings' },
  });

  const ok = check(res, {
    'upcoming bookings: status 200 or 400': (r) => r.status === 200 || r.status === 400,
    'upcoming bookings: response time < 400ms': (r) => r.timings.duration < 400,
  });
  errorRate.add(!ok);
}

// Scenario 3: attempt a booking (write endpoint under load)
function attemptBooking() {
  const payload = JSON.stringify({
    eventId: 'test-event-id',
    numberOfSeats: 1,
    paymentMethod: 'CREDIT_CARD',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'CreateBooking' },
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/bookings?userId=test-user-id`, payload, params);
  bookingDuration.add(Date.now() - start);

  // Accept 200 (success) or 400 (business rule rejection — expected with test data)
  const ok = check(res, {
    'create booking: not a 5xx': (r) => r.status < 500,
    'create booking: response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  errorRate.add(!ok);
}

export default function () {
  const scenario = Math.random();

  if (scenario < 0.6) {
    browseEvents();
  } else if (scenario < 0.85) {
    fetchUpcomingBookings();
  } else {
    attemptBooking();
  }

  sleep(1);
}
