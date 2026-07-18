import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ enum: ClientStatus })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
