import http from 'k6/http';
import { sleep, check } from 'k6';

// k6 config options for 500 concurrent users (members)
export const options = {
  stages: [
    { duration: '15s', target: 500 },  // Ramp up to 500 concurrent users
    { duration: '30s', target: 500 },  // Stay at 500 users for 30s
    { duration: '15s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete under 3.0s under heavy concurrent load
    http_req_failed: ['rate<0.05'],    // Error rate must be less than 5%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
  };

  // --- SCENARIO 1: Visit homepage ---
  const homeRes = http.get(`${BASE_URL}/`, { headers });
  check(homeRes, {
    'Homepage status is 200': (r) => r.status === 200,
  });
  sleep(Math.random() * 2 + 1);

  // --- SCENARIO 2: Browse gallery ---
  const galleryRes = http.get(`${BASE_URL}/gallery`, { headers });
  check(galleryRes, {
    'Gallery status is 200': (r) => r.status === 200,
  });
  sleep(Math.random() * 2 + 1);

  // --- SCENARIO 3: Get posts (DB Query) ---
  const postsRes = http.get(`${BASE_URL}/api/posts?limit=10`, { headers });
  check(postsRes, {
    'GET Posts status is 200': (r) => r.status === 200,
    'GET Posts returned valid JSON': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    }
  });
  sleep(Math.random() * 2 + 1);

  // --- SCENARIO 4: Get submissions (DB Query) ---
  const submissionsRes = http.get(`${BASE_URL}/api/submissions`, { headers });
  check(submissionsRes, {
    'GET Submissions status is 200': (r) => r.status === 200,
    'GET Submissions returned valid JSON': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    }
  });
  sleep(Math.random() * 2 + 1);
}

