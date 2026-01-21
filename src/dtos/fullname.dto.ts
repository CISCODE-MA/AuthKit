import { IsNotEmpty, IsString } from "class-validator";

export class FullnameDto {
    @IsString()
    @IsNotEmpty()
    fname!: string;

    @IsString()
    @IsNotEmpty()
    lname!: string;
}