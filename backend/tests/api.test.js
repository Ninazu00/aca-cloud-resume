jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = { query: mockQuery };
  return { Pool: jest.fn(() => mockPool) };
});

const request = require('supertest');
const app = require('../server');

describe('GET /api/visits', () => {
  it('returns 200 with a count', async () => {
    const { Pool } = require('pg');
    const pool = new Pool();
    pool.query.mockResolvedValueOnce({ rows: [{ total: '42' }] });

    const res = await request(app).get('/api/visits');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
  });

  it('returns 500 on database error', async () => {
    const { Pool } = require('pg');
    const pool = new Pool();
    pool.query.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/visits');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/visit', () => {
  it('returns 200 with a count', async () => {
    const { Pool } = require('pg');
    const pool = new Pool();
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ total: '43' }] });

    const res = await request(app).post('/api/visit');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
  });

  it('returns 500 on database error', async () => {
    const { Pool } = require('pg');
    const pool = new Pool();
    pool.query.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).post('/api/visit');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});