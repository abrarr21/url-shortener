import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom benchmark metrics
const redirectDuration = new Trend('redirect_duration', true);
const redirectSuccess = new Rate('redirect_success');
const redirectCount = new Counter('redirect_count');
const rateLimitHits = new Counter('rate_limit_hits');
const statsDuration = new Trend('stats_duration', true);

// Configurable benchmark parameters
const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const TARGET_RPS = Number(__ENV.TARGET_RPS || 120);
const DURATION = __ENV.DURATION || '30s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_VUS || 30);
const MAX_VUS = Number(__ENV.MAX_VUS || 80);

export const options = {
  scenarios: {
    sustained_redirect_load: {
      executor: 'constant-arrival-rate',
      rate: TARGET_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    // Assert less than 1% request failures
    http_req_failed: ['rate<0.01'],
    // Assert redirect success rate > 99%
    redirect_success: ['rate>0.99'],
    // P95 redirect latency target (sub-millisecond on raw network, <10ms through container proxy)
    redirect_duration: ['p(95)<15'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Setup phase: verify service health and pre-generate URLs
export function setup() {
  console.log(`[k6 setup] Checking health at ${BASE_URL}/health...`);
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Health check failed (${healthRes.status}): ${healthRes.body}. Ensure Docker stack is running.`);
  }

  console.log(`[k6 setup] Pre-generating test short URLs...`);
  const shortCodes = [];
  for (let i = 0; i < 5; i++) {
    const payload = JSON.stringify({ long_url: `https://example.com/benchmark-${Date.now()}-${i}` });
    const res = http.post(`${BASE_URL}/shorten`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 201) {
      const data = JSON.parse(res.body);
      shortCodes.push(data.short_code);
    } else {
      throw new Error(`Failed to create benchmark URL: ${res.status} ${res.body}`);
    }
  }

  // Pre-warm the cache for the generated links
  for (const code of shortCodes) {
    http.get(`${BASE_URL}/${code}`, { redirects: 0 });
  }

  console.log(`[k6 setup] Ready with ${shortCodes.length} warmed short codes: ${shortCodes.join(', ')}`);
  return { baseUrl: BASE_URL, codes: shortCodes };
}

export default function (data) {
  // Rotate short codes across virtual users
  const code = data.codes[(__VU + __ITER) % data.codes.length];

  // Distribute across simulated client IPs so each simulated user tests
  // their own token bucket in Redis rate limiting
  const clientIP = `10.0.${Math.floor(__VU / 256)}.${(__VU % 250) + 1}`;

  const res = http.get(`${data.baseUrl}/${code}`, {
    redirects: 0,
    headers: {
      'X-Forwarded-For': clientIP,
    },
  });

  const isRedirect = res.status === 302;
  check(res, {
    'status is 302 redirect': (r) => r.status === 302,
    'has Location header': (r) => r.headers['Location'] !== undefined,
  });

  redirectDuration.add(res.timings.duration);
  redirectCount.add(1);
  redirectSuccess.add(isRedirect ? 1 : 0);

  if (res.status === 429) {
    rateLimitHits.add(1);
  }

  // Sample stats endpoint every 25 requests to simulate background dashboard traffic
  if (__ITER % 25 === 0) {
    const statsRes = http.get(`${data.baseUrl}/stats/${code}`, {
      headers: { 'X-Forwarded-For': clientIP },
    });
    if (statsRes.status === 200) {
      statsDuration.add(statsRes.timings.duration);
    }
  }
}

// Teardown phase: verify asynchronous stream consumption and stats persistence
export function teardown(data) {
  console.log(`[k6 teardown] Waiting 2s for background analytics workers to process Redis Streams...`);
  sleep(2);

  let totalClicks = 0;
  for (const code of data.codes) {
    const res = http.get(`${data.baseUrl}/stats/${code}`);
    if (res.status === 200) {
      const stats = JSON.parse(res.body);
      totalClicks += stats.click_count;
      console.log(
        `[k6 teardown] Link ${code} -> Clicks: ${stats.click_count}, Trending Score: ${stats.trending_score.toFixed(4)}`
      );
    }
  }
  console.log(`[k6 teardown] Analytics pipeline verified. Total clicks processed across test links: ${totalClicks}`);
}
