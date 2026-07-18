import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, CreatePaymentDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createInvoiceDto: CreateInvoiceDto) {
    const { clientId, note, status, dueDate, items } = createInvoiceDto;

    // Verify client exists and belongs to user
    const client = await this.prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) throw new NotFoundException('Client not found');

    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Use transaction to ensure invoice and items are created together
    return this.prisma.$transaction(async (prisma) => {
      const invoice = await prisma.invoice.create({
        data: {
          userId,
          clientId,
          invoiceNumber,
          note,
          status,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          items: {
            create: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: true }
      });
      return invoice;
    });
  }

  async findAll(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { client: true, items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { client: true, items: true, payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { clientId, invoiceId, amount, date, method } = createPaymentDto;

    const client = await this.prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) throw new NotFoundException('Client not found');

    if (invoiceId) {
      const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, userId } });
      if (!invoice) throw new NotFoundException('Invoice not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          userId,
          clientId,
          invoiceId,
          amount,
          date: new Date(date),
          method,
        }
      });

      // If tied to an invoice, potentially update invoice status if fully paid
      if (invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { items: true, payments: true }
        });

        if (invoice) {
          const totalAmount = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
          const totalPaid = invoice.payments.reduce((sum, pay) => sum + pay.amount, 0);

          if (totalPaid >= totalAmount) {
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID' }
            });
          }
        }
      }

      return payment;
    });
  }

  async remove(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, userId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.delete({ where: { id } });
  }
}
