using FleetTrack.Api.Dtos.MaintenanceLogs;

namespace FleetTrack.Api.Dtos.Dashboard;

public record DashboardSummaryDto(
    int TotalActiveVehicles,
    decimal TotalLifetimeCost,
    decimal CostThisMonth,
    decimal CostThisYear,
    decimal AverageCostPerVehicle,
    int VehiclesDueForService,
    List<MaintenanceLogDto> RecentLogs);