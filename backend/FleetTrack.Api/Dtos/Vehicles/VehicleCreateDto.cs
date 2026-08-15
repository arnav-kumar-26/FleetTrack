namespace FleetTrack.Api.Dtos.Vehicles;

public record VehicleCreateDto(
    string Make,
    string Model,
    int Year,
    string PlateNumber,
    int CurrentMileage,
    int? ServiceIntervalMonths,
    int? ServiceIntervalMileage);