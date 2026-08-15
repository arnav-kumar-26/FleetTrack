using FleetTrack.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Api.Data;

public class FleetTrackDbContext : IdentityDbContext<ApplicationUser>
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<MaintenanceLog> MaintenanceLogs => Set<MaintenanceLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Vehicle>()
            .HasIndex(v => v.PlateNumber)
            .IsUnique();

        builder.Entity<MaintenanceLog>()
            .Property(l => l.Cost)
            .HasColumnType("numeric(10,2)");

        builder.Entity<Vehicle>()
            .HasMany(v => v.MaintenanceLogs)
            .WithOne(l => l.Vehicle)
            .HasForeignKey(l => l.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
