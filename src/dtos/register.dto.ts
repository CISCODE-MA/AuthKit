import { IsEmail, IsOptional, IsString, MinLength, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class FullNameDto {
    @IsString() fname!: string;
    @IsString() lname!: string;
}

export class RegisterDto {
    @ValidateNested()
    @Type(() => FullNameDto)
    fullname!: FullNameDto;

    @IsString()
    @MinLength(3)
    username!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}
