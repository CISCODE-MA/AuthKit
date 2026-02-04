import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Data Transfer Object for forgot password request
 */
export class ForgotPasswordDto {
    @ApiProperty({
        description: 'User email address to send password reset link',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;
}
