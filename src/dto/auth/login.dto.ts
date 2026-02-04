import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

/**
 * Data Transfer Object for user login
 */
export class LoginDto {
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
}
