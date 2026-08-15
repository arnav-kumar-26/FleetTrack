namespace FleetTrack.Api.Dtos.Vehicles;

public record VehicleDto(
    int Id,
    string Make,
    string Model,
    int Year,
    string PlateNumber,
    int CurrentMileage,
    int? ServiceIntervalMonths,
    int? ServiceIntervalMileage,
    bool IsActive,
    DateOnly? NextServiceDueDate,
    int? NextServiceDueMileage,
    bool IsServiceDue);