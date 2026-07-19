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

  async getMonthlyFinanceData(userId: string) {
    // Simplified logic: group payments and expenses by month (for the current year)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);

    const payments = await this.prisma.payment.findMany({
      where: { userId, date: { gte: startDate } }
    });

    const expenses = await this.prisma.expense.findMany({
      where: { userId, status: ExpenseStatus.PAID, date: { gte: startDate } }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({ month, income: 0, expense: 0 }));

    payments.forEach(p => {
      const monthIndex = p.date.getMonth();
      monthlyData[monthIndex].income += p.amount;
    });

    expenses.forEach(e => {
      const monthIndex = e.date.getMonth();
      monthlyData[monthIndex].expense += e.amount;
    });

    // Return only up to current month to match charts
    const currentMonthIndex = new Date().getMonth();
    return monthlyData.slice(0, currentMonthIndex + 1);
  }

  async getRecentOverdueInvoices(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId, status: InvoiceStatus.OVERDUE },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return invoices.map(inv => {
      const totalAmount = inv.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client.name,
        amount: totalAmount,
        dueDate: inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : null,
        daysOverdue: inv.dueDate ? Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 3600 * 24)) : 0
      };
    });
  }

  async getRecentClients(userId: string) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      }
    });
  }
}
