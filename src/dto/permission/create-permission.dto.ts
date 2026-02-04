import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new permission
 */
export class CreatePermissionDto {
    @ApiProperty({
        description: 'Permission name (must be unique)',
        example: 'users:read',
    })
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        description: 'Permission description',
        example: 'Allows reading user data',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
