import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FullnameDto } from './fullname.dto';

export class RegisterUserDto {
    @ValidateNested()
    @Type(() => FullnameDto)
    fullname!: FullnameDto;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsString()
    @MinLength(6)
    password!: string;
}
