import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

/**
 * Data Transfer Object for updating user roles
 */
export class UpdateUserRolesDto {
    @ApiProperty({
        description: 'Array of role IDs to assign to the user',
        example: ['65f1b2c3d4e5f6789012345a', '65f1b2c3d4e5f6789012345b'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    roles!: string[];
}
