import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp, createInitialStore } from './app.js';

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

async function login(name = 'Tester API') {
  const { response, body } = await request('/api/auth/mock-login', {
    method: 'POST',
    body: JSON.stringify({ name, userId: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }),
  });

  assert.equal(response.status, 201);
  assert.ok(body.token);
  return body;
}

describe('Sopockie Ławeczki API', () => {
  before(async () => {
    const app = createApp({ store: createInitialStore() });
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    baseUrl = `http://${address.address}:${address.port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('returns health status', async () => {
    const { response, body } = await request('/api/health');

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.qb, 'disabled');
  });

  it('keeps meetings behind mock auth', async () => {
    const { response, body } = await request('/api/meetings');

    assert.equal(response.status, 401);
    assert.equal(body.error, 'AUTH_REQUIRED');
  });

  it('lists public benches and routes for guests', async () => {
    const benches = await request('/api/benches');
    const routes = await request('/api/routes');

    assert.equal(benches.response.status, 200);
    assert.ok(benches.body.benches.length >= 6);
    assert.equal(routes.response.status, 200);
    assert.ok(routes.body.routes.some((route) => route.source === 'official'));
  });

  it('creates bench, favorite, report and sos event as logged user', async () => {
    const { token } = await login();
    const auth = { authorization: `Bearer ${token}` };

    const created = await request('/api/benches', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        name: 'Ławka API test',
        address: 'Testowa 1, Sopot',
        lat: 54.4418,
        lng: 18.5603,
        capacity: 2,
        description: 'Test endpointu dodawania ławki.',
      }),
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.bench.name, 'Ławka API test');
    assert.equal(created.body.user.points, 10);

    const favorite = await request(`/api/benches/${created.body.bench.id}/favorite`, {
      method: 'POST',
      headers: auth,
    });
    assert.equal(favorite.response.status, 200);
    assert.deepEqual(favorite.body.favorites, [created.body.bench.id]);

    const report = await request('/api/reports', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ targetType: 'BENCH', targetId: created.body.bench.id, reason: 'Test zgłoszenia API' }),
    });
    assert.equal(report.response.status, 201);
    assert.equal(report.body.report.targetType, 'BENCH');

    const sos = await request('/api/sos', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ contactName: 'Kontakt testowy', contactPhone: '+48 000 000 000' }),
    });
    assert.equal(sos.response.status, 201);
    assert.equal(sos.body.event.contactName, 'Kontakt testowy');
  });

  it('creates meetings and blocks overlapping reservations', async () => {
    const { token } = await login('Spotkaniowy Tester');
    const auth = { authorization: `Bearer ${token}` };
    const startAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    const created = await request('/api/meetings', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        benchId: 'bench-1',
        title: 'Spotkanie testowe',
        startAt,
        durationMin: 45,
        maxParticipants: 3,
      }),
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.meeting.benchId, 'bench-1');

    const availability = await request(`/api/benches/bench-1/meeting-availability?startAt=${encodeURIComponent(startAt)}&durationMin=30`, {
      headers: auth,
    });
    assert.equal(availability.response.status, 200);
    assert.equal(availability.body.canCreate, false);
    assert.equal(availability.body.meetingId, created.body.meeting.id);

    const duplicate = await request('/api/meetings', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        benchId: 'bench-1',
        title: 'Konflikt terminu',
        startAt,
        durationMin: 30,
        maxParticipants: 3,
      }),
    });

    assert.equal(duplicate.response.status, 409);
    assert.equal(duplicate.body.error, 'BENCH_OCCUPIED');
  });

  it('creates a community route and allows favorites', async () => {
    const { token } = await login('Trasy Tester');
    const auth = { authorization: `Bearer ${token}` };

    const created = await request('/api/routes', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        title: 'Trasa API test',
        category: 'piesza',
        difficulty: 'lekka',
        startPlace: 'Sopot test',
        summary: 'Test endpointu tras.',
        highlights: ['api', 'test'],
        visibility: 'public',
        path: [
          [54.4418, 18.5603],
          [54.4428, 18.5613],
        ],
      }),
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.route.source, 'community');
    assert.ok(created.body.route.distanceKm > 0);

    const favorite = await request(`/api/routes/${created.body.route.id}/favorite`, {
      method: 'POST',
      headers: auth,
    });
    assert.equal(favorite.response.status, 200);
    assert.deepEqual(favorite.body.favorites, [created.body.route.id]);
  });
});
