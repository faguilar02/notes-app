import { IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(5)
  password: string;
}
