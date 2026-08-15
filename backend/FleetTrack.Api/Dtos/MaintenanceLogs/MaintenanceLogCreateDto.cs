namespace FleetTrack.Api.Dtos.MaintenanceLogs;

public record MaintenanceLogCreateDto(
    int VehicleId,
    DateOnly ServiceDate,
    string Description,
    decimal Cost,
    int MileageAtService);