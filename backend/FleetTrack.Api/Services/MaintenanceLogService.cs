using FleetTrack.Api.Data;
using FleetTrack.Api.Dtos.MaintenanceLogs;
using FleetTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Api.Services;

public class MaintenanceLogService : IMaintenanceLogService
{
    private readonly FleetTrackDbContext _db;

    public MaintenanceLogService(FleetTrackDbContext db)
    {
        _db = db;
    }

    public async Task<List<MaintenanceLogDto>> GetAllAsync(int? vehicleId, DateOnly? fromDate, DateOnly? toDate)
    {
        var query = _db.MaintenanceLogs.AsNoTracking();

        if (vehicleId.HasValue)
        {
            query = query.Where(l => l.VehicleId == vehicleId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(l => l.ServiceDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(l => l.ServiceDate <= toDate.Value);
        }

        var logs = await query.OrderByDescending(l => l.ServiceDate).ToListAsync();
        return logs.Select(ToDto).ToList();
    }

    public async Task<MaintenanceLogDto?> GetByIdAsync(int id)
    {
        var log = await _db.MaintenanceLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id);
        return log is null ? null : ToDto(log);
    }

    public async Task<MaintenanceLogDto?> CreateAsync(MaintenanceLogCreateDto dto)
    {
        var vehicle = await _db.Vehicles.FindAsync(dto.VehicleId);
        if (vehicle is null)
        {
            return null;
        }

        var log = new MaintenanceLog
        {
            VehicleId = dto.VehicleId,
            ServiceDate = dto.ServiceDate,
            Description = dto.Description,
            Cost = dto.Cost,
            MileageAtService = dto.MileageAtService
        };

        _db.MaintenanceLogs.Add(log);

        if (dto.MileageAtService > vehicle.CurrentMileage)
        {
            vehicle.CurrentMileage = dto.MileageAtService;
        }

        await _db.SaveChangesAsync();
        return ToDto(log);
    }

    public async Task<MaintenanceLogDto?> UpdateAsync(int id, MaintenanceLogUpdateDto dto)
    {
        var log = await _db.MaintenanceLogs.FindAsync(id);
        if (log is null)
        {
            return null;
        }

        log.ServiceDate = dto.ServiceDate;
        log.Description = dto.Description;
        log.Cost = dto.Cost;
        log.MileageAtService = dto.MileageAtService;

        await _db.SaveChangesAsync();
        return ToDto(log);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var log = await _db.MaintenanceLogs.FindAsync(id);
        if (log is null)
        {
            return false;
        }

        _db.MaintenanceLogs.Remove(log);
        await _db.SaveChangesAsync();
        return true;
    }

    private static MaintenanceLogDto ToDto(MaintenanceLog log)
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