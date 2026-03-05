<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
=======
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for updating user roles
 */
export class UpdateUserRolesDto {
<<<<<<< HEAD
    @ApiProperty({
        description: 'Array of role IDs to assign to the user',
        example: ['65f1b2c3d4e5f6789012345a', '65f1b2c3d4e5f6789012345b'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    roles!: string[];
=======
  @ApiProperty({
    description: "Array of role IDs to assign to the user",
    example: ["65f1b2c3d4e5f6789012345a", "65f1b2c3d4e5f6789012345b"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
