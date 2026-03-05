<<<<<<< HEAD
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
=======
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for refreshing access token
 */
export class RefreshTokenDto {
<<<<<<< HEAD
    @ApiPropertyOptional({
        description: 'Refresh token (can be provided in body or cookie)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsOptional()
    @IsString()
    refreshToken?: string;
=======
  @ApiPropertyOptional({
    description: "Refresh token (can be provided in body or cookie)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
