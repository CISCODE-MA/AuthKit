import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for updating an existing role
 */
export class UpdateRoleDto {
    @ApiPropertyOptional({
        description: 'Role name',
        example: 'super-admin',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Array of permission IDs to assign to this role',
        example: ['65f1b2c3d4e5f6789012345a'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}

/**
 * Data Transfer Object for updating role permissions only
 */
export class UpdateRolePermissionsDto {
    @ApiProperty({
        description: 'Array of permission IDs (MongoDB ObjectId strings)',
        example: ['65f1b2c3d4e5f6789012345a', '65f1b2c3d4e5f6789012345b'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    permissions!: string[];
}

