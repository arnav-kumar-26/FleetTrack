namespace FleetTrack.Api.Models;

public class MaintenanceLog
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public DateOnly ServiceDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public int MileageAtService { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
}
