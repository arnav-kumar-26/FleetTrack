namespace FleetTrack.Api.Dtos.MaintenanceLogs;

public record MaintenanceLogDto(
    int Id,
    int VehicleId,
    DateOnly ServiceDate,
    string Description,
    decimal Cost,
    int MileageAtService);