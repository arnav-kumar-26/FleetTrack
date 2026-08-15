using FleetTrack.Api.Data;
using FleetTrack.Api.Dtos.MaintenanceLogs;
using FleetTrack.Api.Dtos.Vehicles;
using FleetTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Api.Services;

public class VehicleService : IVehicleService
{
    private readonly FleetTrackDbContext _db;

    public VehicleService(FleetTrackDbContext db)
    {
        _db = db;
    }

    public async Task<List<VehicleDto>> GetAllAsync()
    {
        var items = await _db.Vehicles
            .Select(v => new { v, Latest = v.MaintenanceLogs.OrderByDescending(l => l.ServiceDate).FirstOrDefault() })
            .ToListAsync();

        return items.Select(x => ToDto(x.v, x.Latest)).ToList();
    }

    public async Task<VehicleDto?> GetByIdAsync(int id)
    {
        var item = await _db.Vehicles
            .Select(v => new { v, Latest = v.MaintenanceLogs.OrderByDescending(l => l.ServiceDate).FirstOrDefault() })
            .FirstOrDefaultAsync(x => x.v.Id == id);

        return item is null ? null : ToDto(item.v, item.Latest);
    }

    public async Task<List<VehicleDto>> GetDueForServiceAsync()
    {
        var items = await _db.Vehicles
            .Where(v => v.IsActive)
            .Select(v => new { v, Latest = v.MaintenanceLogs.OrderByDescending(l => l.ServiceDate).FirstOrDefault() })
            .ToListAsync();

        return items
            .Select(x => ToDto(x.v, x.Latest))
            .Where(dto => dto.IsServiceDue)
            .ToList();
    }

    public async Task<VehicleDto> CreateAsync(VehicleCreateDto dto)
    {
        var vehicle = new Vehicle
        {
            Make = dto.Make,
            Model = dto.Model,
            Year = dto.Year,
            PlateNumber = dto.PlateNumber,
            CurrentMileage = dto.CurrentMileage,
            ServiceIntervalMonths = dto.ServiceIntervalMonths,
            ServiceIntervalMileage = dto.ServiceIntervalMileage,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return ToDto(vehicle, null);
    }

    public async Task<VehicleDto?> UpdateAsync(int id, VehicleUpdateDto dto)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null)
        {
            return null;
        }

        vehicle.Make = dto.Make;
        vehicle.Model = dto.Model;
        vehicle.Year = dto.Year;
        vehicle.ServiceIntervalMonths = dto.ServiceIntervalMonths;
        vehicle.ServiceIntervalMileage = dto.ServiceIntervalMileage;

        await _db.SaveChangesAsync();

        var latest = await _db.MaintenanceLogs
            .Where(l => l.VehicleId == id)
            .OrderByDescending(l => l.ServiceDate)
            .FirstOrDefaultAsync();

        return ToDto(vehicle, latest);
    }

    public async Task<bool> ArchiveAsync(int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null)
        {
            return false;
        }

        vehicle.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<MaintenanceLogDto>> GetMaintenanceLogsForVehicleAsync(int id)
    {
        return await _db.MaintenanceLogs
            .Where(l => l.VehicleId == id)
            .OrderByDescending(l => l.ServiceDate)
            .Select(l => new MaintenanceLogDto(
                l.Id,
                l.VehicleId,
                l.ServiceDate,
                l.Description,
                l.Cost,
                l.MileageAtService))
            .ToListAsync();
    }

    private static VehicleDto ToDto(Vehicle vehicle, MaintenanceLog? latest)
    {
        var (nextDate, nextMileage, isDue) = ComputeServiceDue(vehicle, latest);

        return new VehicleDto(
            vehicle.Id,
            vehicle.Make,
            vehicle.Model,
            vehicle.Year,
            vehicle.PlateNumber,
            vehicle.CurrentMileage,
            vehicle.ServiceIntervalMonths,
            vehicle.ServiceIntervalMileage,
            vehicle.IsActive,
            nextDate,
            nextMileage,
            isDue);
    }

    private static (DateOnly? NextServiceDueDate, int? NextServiceDueMileage, bool IsServiceDue) ComputeServiceDue(
        Vehicle vehicle, MaintenanceLog? latest)
    {
        if (!vehicle.ServiceIntervalMonths.HasValue && !vehicle.ServiceIntervalMileage.HasValue)
        {
            return (null, null, false);
        }

        DateOnly baselineDate;
        int baselineMileage;

        if (latest is not null)
        {
            baselineDate = latest.ServiceDate;
            baselineMileage = latest.MileageAtService;
        }
        else
        {
            baselineDate = DateOnly.FromDateTime(vehicle.CreatedAt);
            baselineMileage = vehicle.CurrentMileage;
        }

        var nextDate = vehicle.ServiceIntervalMonths.HasValue
            ? (DateOnly?)baselineDate.AddMonths(vehicle.ServiceIntervalMonths.Value)
            : null;
        var nextMileage = vehicle.ServiceIntervalMileage.HasValue
            ? (int?)(baselineMileage + vehicle.ServiceIntervalMileage.Value)
            : null;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var isDue = (nextDate.HasValue && today >= nextDate.Value)
            || (nextMileage.HasValue && vehicle.CurrentMileage >= nextMileage.Value);

        return (nextDate, nextMileage, isDue);
    }
}