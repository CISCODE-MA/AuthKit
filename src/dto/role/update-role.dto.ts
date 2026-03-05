<<<<<<< HEAD
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
=======
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for updating an existing role
 */
export class UpdateRoleDto {
<<<<<<< HEAD
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
=======
  @ApiPropertyOptional({
    description: "Role name",
    example: "super-admin",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Array of permission IDs to assign to this role",
    example: ["65f1b2c3d4e5f6789012345a"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}

/**
 * Data Transfer Object for updating role permissions only
 */
export class UpdateRolePermissionsDto {
<<<<<<< HEAD
    @ApiProperty({
        description: 'Array of permission IDs (MongoDB ObjectId strings)',
        example: ['65f1b2c3d4e5f6789012345a', '65f1b2c3d4e5f6789012345b'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    permissions!: string[];
}

=======
  @ApiProperty({
    description: "Array of permission IDs (MongoDB ObjectId strings)",
    example: ["65f1b2c3d4e5f6789012345a", "65f1b2c3d4e5f6789012345b"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
