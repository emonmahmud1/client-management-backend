import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, ExpenseStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(userId: string) {
    // Total Revenue (Sum of all payments made to invoices/clients)
    const totalPayments = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { userId },
    });

    // Total Expenses (Sum of paid expenses)
    const totalExpenses = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: { userId, status: ExpenseStatus.PAID },
    });

    // Outstanding Dues (Total Invoice amounts minus Total Payments)
    // To do this accurately, we can get all invoices and their items
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: { items: true }
    });

    const totalInvoiced = invoices.reduce((sum, inv) => {
      return sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0);
    }, 0);

    const outstandingDues = totalInvoiced - (totalPayments._sum.amount || 0);

    return [
      { label: 'Total Revenue', value: totalPayments._sum.amount || 0, trendLabel: '+0% from last month', tone: 'default' },
      { label: 'Total Expenses', value: totalExpenses._sum.amount || 0, trendLabel: '+0% from last month', tone: 'danger' },
      { label: 'Outstanding Dues', value: outstandingDues > 0 ? outstandingDues : 0, trendLabel: '0% collected', tone: 'default' },
    ];
  }

  async getInvoiceStatusBreakdown(userId: string) {
    const breakdown = await this.prisma.invoice.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { userId }
    });

    return breakdown.map(b => ({
      name: b.status === InvoiceStatus.PAID ? 'Paid' : b.status === InvoiceStatus.DUE ? 'Due' : 'Overdue',
      value: b._count.id
    }));
  }

  async getExpenseCategoryTotals(userId: string) {
    const totals = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: { userId }
    });

    return totals.map(t => ({
      category: t.category,
      amount: t._sum.amount || 0
    }));
  }
}
