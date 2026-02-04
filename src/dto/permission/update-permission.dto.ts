import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for updating an existing permission
 */
export class UpdatePermissionDto {
    @ApiPropertyOptional({
        description: 'Permission name',
        example: 'users:write',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Permission description',
        example: 'Allows modifying user data',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
