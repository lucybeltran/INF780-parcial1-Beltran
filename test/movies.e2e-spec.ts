
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

const movieData = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: 'sci-fi',
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
};

const updateData = {
  rating: 9.0,
  synopsis: 'Updated synopsis for testing purposes.',
};

const invalidUuid = 'not-a-valid-uuid';
const nonExistentUuid = '00000000-0000-4000-a000-000000000000';

describe('Movies E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdMovieId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.query('DELETE FROM movies');
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM movies');
    await app.close();
  });

  // =========================
  // SEARCH E2E (SECCIÓN D)
  // =========================
  describe('/movies/search', () => {

    const seedMovies = [
      { title: 'Inception', director: 'C. Nolan', genre: 'sci-fi', year: 2010, rating: 8.8 },
      { title: 'Interstellar', director: 'C. Nolan', genre: 'sci-fi', year: 2014, rating: 8.6 },
      { title: 'The Godfather', director: 'F. Coppola', genre: 'drama', year: 1972, rating: 9.2 },
      { title: 'Pulp Fiction', director: 'Q. Tarantino', genre: 'drama', year: 1994, rating: 8.9 },
      { title: 'The Dark Knight', director: 'C. Nolan', genre: 'action', year: 2008, rating: 9.0 },
      { title: 'Toy Story', director: 'J. Lasseter', genre: 'animation', year: 1995, rating: 8.3 },
    ];

    beforeAll(async () => {
      await dataSource.query('DELETE FROM movies');

      for (const movie of seedMovies) {
        await request(app.getHttpServer())
          .post('/movies')
          .send(movie);
      }
    });

    // D1
    it('GET /movies/search → 6 películas', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search')
        .expect(200);

      expect(res.body.length).toBe(6);
    });

    // D2
    it('GET /movies/search?genre=sci-fi → 2 películas', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?genre=sci-fi')
        .expect(200);

      expect(res.body.length).toBe(2);

      const titles = res.body.map((m: { title: string }) => m.title);
      expect(titles).toContain('Inception');
      expect(titles).toContain('Interstellar');
    });

    // D3
    it('GET /movies/search?year=1994 → 1 película', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?year=1994')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Pulp Fiction');
    });

    // D4
    it('GET /movies/search?minRating=9.0 → 2 películas', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?minRating=9.0')
        .expect(200);

      expect(res.body.length).toBe(2);

      const titles = res.body.map((m: { title: string }) => m.title);
      expect(titles).toContain('The Godfather');
      expect(titles).toContain('The Dark Knight');
    });

    // D5
    it('GET /movies/search?genre=drama&minRating=9.0 → 1 película', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?genre=drama&minRating=9.0')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('The Godfather');
    });

    // D6
    it('GET /movies/search?genre=horror → []', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?genre=horror')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    // D7
    it('GET /movies/search?year=2030 → []', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?year=2030')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    // D8
    it('GET /movies/search?year=invalid → 422', async () => {
      await request(app.getHttpServer())
        .get('/movies/search?year=invalid')
        .expect(422);
    });

  });

});