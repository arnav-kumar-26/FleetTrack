using FleetTrack.Api.Dtos.Dashboard;

namespace FleetTrack.Api.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<List<CostTrendPointDto>> GetCostTrendAsync(int months);
}