namespace FleetTrack.Api.Models;

public class Vehicle
{
    public int Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public int CurrentMileage { get; set; }
    public int? ServiceIntervalMonths { get; set; }
    public int? ServiceIntervalMileage { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = [];
}
