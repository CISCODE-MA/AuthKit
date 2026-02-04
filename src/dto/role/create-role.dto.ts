import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new role
 */
export class CreateRoleDto {
    @ApiProperty({
        description: 'Role name (must be unique)',
        example: 'admin',
    })
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        description: 'Array of permission IDs to assign to this role',
        example: ['65f1b2c3d4e5f6789012345a', '65f1b2c3d4e5f6789012345b'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
