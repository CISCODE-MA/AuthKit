<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
=======
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for user login
 */
export class LoginDto {
<<<<<<< HEAD
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        type: String,
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'User password (minimum 8 characters)',
        example: 'SecurePass123!',
        type: String,
        minLength: 8,
    })
    @IsString()
    password!: string;
=======
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    type: String,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "SecurePass123!",
    type: String,
    minLength: 8,
  })
  @IsString()
  password!: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
