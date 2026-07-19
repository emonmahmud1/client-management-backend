import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, CreatePaymentDto } from './dto/invoice.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice with items' })
  create(@Req() req: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.sub, createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(@Req() req: any) {
    return this.invoicesService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific invoice by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.sub, id);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Record a payment against a client or invoice' })
  createPayment(@Req() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.invoicesService.createPayment(req.user.sub, createPaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.invoicesService.remove(req.user.sub, id);
  }
}
