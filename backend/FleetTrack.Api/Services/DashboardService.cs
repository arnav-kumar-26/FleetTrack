using FleetTrack.Api.Data;
using FleetTrack.Api.Dtos.Dashboard;
using FleetTrack.Api.Dtos.MaintenanceLogs;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly FleetTrackDbContext _db;
    private readonly IVehicleService _vehicleService;

    public DashboardService(FleetTrackDbContext db, IVehicleService vehicleService)
    {
        _db = db;
        _vehicleService = vehicleService;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateOnly(now.Year, now.Month, 1);
        var yearStart = new DateOnly(now.Year, 1, 1);

        var totalActiveVehicles = await _db.Vehicles.CountAsync(v => v.IsActive);
        var totalVehicles = await _db.Vehicles.CountAsync();

        var totalLifetimeCost = await _db.MaintenanceLogs.SumAsync(l => (decimal?)l.Cost) ?? 0m;
        var costThisMonth = await _db.MaintenanceLogs
            .Where(l => l.ServiceDate >= monthStart)
            .SumAsync(l => (decimal?)l.Cost) ?? 0m;
        var costThisYear = await _db.MaintenanceLogs
            .Where(l => l.ServiceDate >= yearStart)
            .SumAsync(l => (decimal?)l.Cost) ?? 0m;

        var averageCostPerVehicle = totalVehicles > 0
            ? totalLifetimeCost / totalVehicles
            : 0m;

        var vehiclesDueForService = (await _vehicleService.GetDueForServiceAsync()).Count;

        var recentLogs = await _db.MaintenanceLogs
            .AsNoTracking()
            .OrderByDescending(l => l.ServiceDate)
            .Take(5)
            .ToListAsync();

        return new DashboardSummaryDto(
            totalActiveVehicles,
            totalLifetimeCost,
            costThisMonth,
            costThisYear,
            averageCostPerVehicle,
            vehiclesDueForService,
            recentLogs.Select(ToDto).ToList());
    }

    public async Task<List<CostTrendPointDto>> GetCostTrendAsync(int months)
    {
        if (months < 1)
        {
            months = 6;
        }

        var now = DateTime.UtcNow;
        var start = new DateOnly(now.Year, now.Month, 1).AddMonths(-(months - 1));

        var logs = await _db.MaintenanceLogs
            .AsNoTracking()
            .Where(l => l.ServiceDate >= start)
            .ToListAsync();

        return logs
            .GroupBy(l => $"{l.ServiceDate.Year}-{l.ServiceDate.Month:D2}")
            .OrderBy(g => g.Key)
            .Select(g => new CostTrendPointDto(g.Key, g.Sum(l => l.Cost)))
            .ToList();
    }

    private static MaintenanceLogDto ToDto(Models.MaintenanceLog log)
    {
        return new MaintenanceLogDto(
            log.Id,
            log.VehicleId,
            log.ServiceDate,
            log.Description,
            log.Cost,
            log.MileageAtService);
    }
}