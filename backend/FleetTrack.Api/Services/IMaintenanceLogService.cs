using FleetTrack.Api.Dtos.MaintenanceLogs;

namespace FleetTrack.Api.Services;

public interface IMaintenanceLogService
{
    Task<List<MaintenanceLogDto>> GetAllAsync(int? vehicleId, DateOnly? fromDate, DateOnly? toDate);
    Task<MaintenanceLogDto?> GetByIdAsync(int id);
    Task<MaintenanceLogDto?> CreateAsync(MaintenanceLogCreateDto dto);
    Task<MaintenanceLogDto?> UpdateAsync(int id, MaintenanceLogUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}