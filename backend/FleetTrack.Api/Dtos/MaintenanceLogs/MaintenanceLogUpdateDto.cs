namespace FleetTrack.Api.Dtos.MaintenanceLogs;

public record MaintenanceLogUpdateDto(
    DateOnly ServiceDate,
    string Description,
    decimal Cost,
    int MileageAtService);