<<<<<<< HEAD
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
=======
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for creating a new permission
 */
export class CreatePermissionDto {
<<<<<<< HEAD
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
=======
  @ApiProperty({
    description: "Permission name (must be unique)",
    example: "users:read",
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: "Permission description",
    example: "Allows reading user data",
  })
  @IsOptional()
  @IsString()
  description?: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
