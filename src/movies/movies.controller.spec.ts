
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Genre } from './entities/movie.entity';
import { Movie } from './entities/movie.entity';

const mockMoviesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),
};

const movieData = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: 'sci-fi',
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
};

const mockMovie: Movie = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: Genre.SCIFI,
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const invalidUuid = 'not-a-valid-uuid';
const nonExistentUuid = '00000000-0000-4000-a000-000000000000';

describe('MoviesController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================
  // SEARCH (SECCIÓN C)
  // =========================
  describe('GET /movies/search', () => {

    // C1: sin filtros
    it('debe retornar 200 y un array', async () => {
      mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

      const res = await request(app.getHttpServer())
        .get('/movies/search')
        .expect(200);

      expect(res.body[0]).toMatchObject({
  title: 'Inception',
  director: 'Christopher Nolan',
});
      expect(mockMoviesService.search).toHaveBeenCalledWith({});
    });

    // C2: filtro por género
    it('debe filtrar por género', async () => {
      mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

      await request(app.getHttpServer())
        .get('/movies/search?genre=drama')
        .expect(200);

      expect(mockMoviesService.search).toHaveBeenCalledWith({
        genre: 'drama',
      });
    });

    // C3: conversión a number (IMPORTANTE)
    it('debe convertir year y minRating a number', async () => {
      mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

      await request(app.getHttpServer())
        .get('/movies/search?year=2010&minRating=8.5')
        .expect(200);

      expect(mockMoviesService.search).toHaveBeenCalledWith({
        year: 2010,
        minRating: 8.5,
      });
    });

    // C4: genre inválido
    it('debe retornar 422 si genre es inválido', async () => {
      await request(app.getHttpServer())
        .get('/movies/search?genre=invalid')
        .expect(422);
    });

    // C5: year fuera de rango
    it('debe retornar 422 si year es inválido', async () => {
      await request(app.getHttpServer())
        .get('/movies/search?year=1500')
        .expect(422);
    });

    // C6: minRating fuera de rango
    it('debe retornar 422 si minRating es inválido', async () => {
      await request(app.getHttpServer())
        .get('/movies/search?minRating=11')
        .expect(422);
    });

  });

});

