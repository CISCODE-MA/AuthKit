<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
=======
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Data Transfer Object for email verification
 */
export class VerifyEmailDto {
<<<<<<< HEAD
    @ApiProperty({
        description: 'Email verification JWT token from verification link',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    token!: string;
=======
  @ApiProperty({
    description: "Email verification JWT token from verification link",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  token!: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
