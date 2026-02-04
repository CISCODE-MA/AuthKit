import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Data Transfer Object for resending verification email
 */
export class ResendVerificationDto {
    @ApiProperty({
        description: 'User email address to resend verification link',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;
}
