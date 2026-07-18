import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Req() req: any, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.userId, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for the authenticated user' })
  findAll(@Req() req: any) {
    return this.clientsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(@Req() req: any, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(req.user.userId, id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.clientsService.remove(req.user.userId, id);
  }
}
