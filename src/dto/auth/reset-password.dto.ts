import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for password reset
 */
export class ResetPasswordDto {
    @ApiProperty({
        description: 'Password reset JWT token from email link',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    token!: string;

    @ApiProperty({
        description: 'New password (minimum 6 characters)',
        example: 'NewSecurePass123!',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword!: string;
}
