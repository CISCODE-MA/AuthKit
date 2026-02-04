import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * User full name structure
 */
class FullNameDto {
    @ApiProperty({ description: 'First name', example: 'John' })
    @IsString() 
    fname!: string;
    
    @ApiProperty({ description: 'Last name', example: 'Doe' })
    @IsString() 
    lname!: string;
}

/**
 * Data Transfer Object for user registration
 */
export class RegisterDto {
    @ApiProperty({
        description: 'User full name (first and last)',
        type: FullNameDto,
    })
    @ValidateNested()
    @Type(() => FullNameDto)
    fullname!: FullNameDto;

    @ApiPropertyOptional({
        description: 'Unique username (minimum 3 characters). Auto-generated if not provided.',
        example: 'johndoe',
        minLength: 3,
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @ApiProperty({
        description: 'User email address (must be unique)',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'SecurePass123!',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiPropertyOptional({
        description: 'User phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({
        description: 'User avatar URL',
        example: 'https://example.com/avatar.jpg',
    })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiPropertyOptional({
        description: 'User job title',
        example: 'Software Engineer',
    })
    @IsOptional()
    @IsString()
    jobTitle?: string;

    @ApiPropertyOptional({
        description: 'User company name',
        example: 'Ciscode',
    })
    @IsOptional()
    @IsString()
    company?: string;
}
