import {
  isNotEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
