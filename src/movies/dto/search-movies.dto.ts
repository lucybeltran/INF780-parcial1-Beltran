import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Genre } from '../entities/movie.entity';

export class SearchMoviesDto {

  @ApiPropertyOptional({ enum: Genre })
  @IsOptional()
  @IsEnum(Genre, { message: 'genre debe ser un valor válido' })
  genre?: Genre;

  @ApiPropertyOptional({ minimum: 1888, maximum: 2030 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'year debe ser un número entero' })
  @Min(1888, { message: 'year debe ser mayor o igual a 1888' })
  @Max(2030, { message: 'year debe ser menor o igual a 2030' })
  year?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minRating debe ser un número' })
  @Min(0, { message: 'minRating debe ser >= 0' })
  @Max(10, { message: 'minRating debe ser <= 10' })
  minRating?: number;

}