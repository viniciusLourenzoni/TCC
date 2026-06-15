import { ApiProperty } from '@nestjs/swagger';

export class DashboardPeriodDto {
  @ApiProperty({ description: 'Total em centavos' })
  totalCents: number;

  @ApiProperty()
  count: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: DashboardPeriodDto })
  today: DashboardPeriodDto;

  @ApiProperty({ type: DashboardPeriodDto })
  month: DashboardPeriodDto;
}
