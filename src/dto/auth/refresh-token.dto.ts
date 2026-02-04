import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for refreshing access token
 */
export class RefreshTokenDto {
    @ApiPropertyOptional({
        description: 'Refresh token (can be provided in body or cookie)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsOptional()
    @IsString()
    refreshToken?: string;
}
