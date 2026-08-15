namespace FleetTrack.Api.Dtos.Vehicles;

public record VehicleUpdateDto(
    string Make,
    string Model,
    int Year,
    int? ServiceIntervalMonths,
    int? ServiceIntervalMileage);