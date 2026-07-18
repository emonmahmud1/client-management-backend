import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    const clients = await this.prisma.client.findMany({
      where: { userId },
      include: {
        invoices: {
          include: { payments: true, items: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map(client => {
      // Calculate totalPurchase and outstandingDue
      const totalPurchase = client.invoices.reduce((sum, inv) => {
        return sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
      }, 0);

      const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const outstandingDue = totalPurchase - totalPaid;

      // Clean up response by removing the bulky included relations
      const { invoices, payments, ...clientData } = client;

      return {
        ...clientData,
        totalPurchase,
        outstandingDue: outstandingDue > 0 ? outstandingDue : 0,
      };
    });
  }

  async findOne(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        invoices: { include: { items: true } },
        payments: true,
      }
    });

    if (!client) throw new NotFoundException('Client not found');

    const totalPurchase = client.invoices.reduce((sum, inv) => {
      return sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
    }, 0);
    const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingDue = totalPurchase - totalPaid;

    const { invoices, payments, ...clientData } = client;

    return {
      ...clientData,
      totalPurchase,
      outstandingDue: outstandingDue > 0 ? outstandingDue : 0,
    };
  }

  async update(userId: string, id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
