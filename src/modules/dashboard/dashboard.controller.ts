import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard & Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get Dashboard KPIs (Revenue, Expenses, Dues)' })
  getKpis(@Req() req: any) {
    return this.dashboardService.getKpis(req.user.sub);
  }

  @Get('invoice-status')
  @ApiOperation({ summary: 'Get Invoice Status Breakdown for charts' })
  getInvoiceStatusBreakdown(@Req() req: any) {
    return this.dashboardService.getInvoiceStatusBreakdown(req.user.sub);
  }

  @Get('expense-categories')
  @ApiOperation({ summary: 'Get Expense Category Totals for charts' })
  getExpenseCategoryTotals(@Req() req: any) {
    return this.dashboardService.getExpenseCategoryTotals(req.user.sub);
  }

  @Get('monthly-finance')
  @ApiOperation({ summary: 'Get Monthly Income vs Expense Data' })
  getMonthlyFinanceData(@Req() req: any) {
    return this.dashboardService.getMonthlyFinanceData(req.user.sub);
  }

  @Get('recent-overdue-invoices')
  @ApiOperation({ summary: 'Get Top 5 Recent Overdue Invoices' })
  getRecentOverdueInvoices(@Req() req: any) {
    return this.dashboardService.getRecentOverdueInvoices(req.user.sub);
  }

  @Get('recent-clients')
  @ApiOperation({ summary: 'Get Top 5 Newly Added Clients' })
  getRecentClients(@Req() req: any) {
    return this.dashboardService.getRecentClients(req.user.sub);
  }
}
