const request = require('supertest');
const app = require('../src/server');

describe('unit test', () => {

  it('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
  });

  it('401 sans clé API', async () => {
    const res = await request(app).post('/api/python/event').send({});
    expect(res.statusCode).toBe(401);
  });

  describe('tests des controller', () => {
    it('Lister les événements avec des filtres', async () => {
      const res = await request(app).get('/api/events?type=motion&limit=10');
      expect(res.statusCode).toBe(200);
    });

    it('recuperer un événement inexistant (gestion derreur)', async () => {
      const res = await request(app).get('/api/events/65ca8e3f9b2d3e1a2c000000');
      expect(res.statusCode).toBe(404);
    });

    it('changer le statut d une notification ', async () => {
      const res = await request(app).patch('/api/notifications/65ca8e3f9b2d3e1a2c111111/read');
      expect([200, 404]).toContain(res.statusCode);
    });
    
    it('liste des visages autorisés', async () => {
        const res = await request(app).get('/api/faces');
        expect(res.statusCode).toBe(200);
    });
  });
});