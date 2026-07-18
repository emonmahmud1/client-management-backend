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
    return this.dashboardService.getKpis(req.user.userId);
  }

  @Get('invoice-status')
  @ApiOperation({ summary: 'Get Invoice Status Breakdown for charts' })
  getInvoiceStatusBreakdown(@Req() req: any) {
    return this.dashboardService.getInvoiceStatusBreakdown(req.user.userId);
  }

  @Get('expense-categories')
  @ApiOperation({ summary: 'Get Expense Category Totals for charts' })
  getExpenseCategoryTotals(@Req() req: any) {
    return this.dashboardService.getExpenseCategoryTotals(req.user.userId);
  }
}
