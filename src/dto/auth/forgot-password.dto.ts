<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
=======
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for forgot password request
 */
export class ForgotPasswordDto {
<<<<<<< HEAD
    @ApiProperty({
        description: 'User email address to send password reset link',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;
=======
  @ApiProperty({
    description: "User email address to send password reset link",
    example: "user@example.com",
  })
  @IsEmail()
  email!: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
