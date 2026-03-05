<<<<<<< HEAD
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
=======
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for updating an existing permission
 */
export class UpdatePermissionDto {
<<<<<<< HEAD
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
=======
  @ApiPropertyOptional({
    description: "Permission name",
    example: "users:write",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Permission description",
    example: "Allows modifying user data",
  })
  @IsOptional()
  @IsString()
  description?: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
