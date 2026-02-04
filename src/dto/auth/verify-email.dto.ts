import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Data Transfer Object for email verification
 */
export class VerifyEmailDto {
    @ApiProperty({
        description: 'Email verification JWT token from verification link',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    token!: string;
}
