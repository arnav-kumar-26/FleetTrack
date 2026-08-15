using FleetTrack.Api.Dtos.MaintenanceLogs;
using FleetTrack.Api.Dtos.Vehicles;

namespace FleetTrack.Api.Services;

public interface IVehicleService
{
    Task<List<VehicleDto>> GetAllAsync();
    Task<VehicleDto?> GetByIdAsync(int id);
    Task<List<VehicleDto>> GetDueForServiceAsync();
    Task<VehicleDto> CreateAsync(VehicleCreateDto dto);
    Task<VehicleDto?> UpdateAsync(int id, VehicleUpdateDto dto);
    Task<bool> ArchiveAsync(int id);
    Task<List<MaintenanceLogDto>> GetMaintenanceLogsForVehicleAsync(int id);
}