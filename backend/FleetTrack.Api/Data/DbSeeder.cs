using System.Text.Json;
using FleetTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Api.Data;

public static class DbSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task SeedAsync(FleetTrackDbContext db)
    {
        var vehicles = JsonSerializer.Deserialize<List<SeedVehicle>>(VehiclesJson, JsonOptions)!;
        var logs = JsonSerializer.Deserialize<List<SeedLog>>(MaintenanceLogsJson, JsonOptions)!;

        await using var transaction = await db.Database.BeginTransactionAsync();

        await db.MaintenanceLogs.ExecuteDeleteAsync();
        await db.Vehicles.ExecuteDeleteAsync();

        await ResetSequence(db, "Vehicles");
        await ResetSequence(db, "MaintenanceLogs");

        var vehicleEntities = vehicles.Select(v => new Vehicle
        {
            Id = v.Id,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            PlateNumber = v.PlateNumber,
            CurrentMileage = v.CurrentMileage,
            ServiceIntervalMonths = v.ServiceIntervalMonths,
            ServiceIntervalMileage = v.ServiceIntervalMileage,
            CreatedAt = v.CreatedAt.ToUniversalTime(),
            IsActive = v.IsActive,
        }).ToList();

        db.Vehicles.AddRange(vehicleEntities);
        await db.SaveChangesAsync();

        var idMap = new Dictionary<int, int>();
        for (var i = 0; i < vehicles.Count; i++)
        {
            idMap[vehicles[i].Id] = vehicleEntities[i].Id;
        }

        foreach (var log in logs)
        {
            db.MaintenanceLogs.Add(new MaintenanceLog
            {
                Id = log.Id,
                VehicleId = idMap[log.VehicleId],
                ServiceDate = log.ServiceDate,
                Description = log.Description,
                Cost = log.Cost,
                MileageAtService = log.MileageAtService,
            });
        }

        await db.SaveChangesAsync();

        await SyncSequenceToMax(db, "Vehicles");
        await SyncSequenceToMax(db, "MaintenanceLogs");

        await transaction.CommitAsync();

        Console.WriteLine($"[DbSeeder] Seeded {vehicleEntities.Count} vehicles and {logs.Count} maintenance logs.");
    }

    private static Task ResetSequence(FleetTrackDbContext db, string table)
    {
        var sql = "SELECT setval(pg_get_serial_sequence('\"" + table + "\"', 'Id'), 1, false)";
        return db.Database.ExecuteSqlRawAsync(sql);
    }

    private static Task SyncSequenceToMax(FleetTrackDbContext db, string table)
    {
        var sql =
            "SELECT setval(pg_get_serial_sequence('\""
            + table
            + "\"', 'Id'), (SELECT COALESCE(MAX(\"Id\"), 1) FROM \""
            + table
            + "\"))";
        return db.Database.ExecuteSqlRawAsync(sql);
    }

    private sealed record SeedVehicle(
        int Id,
        string Make,
        string Model,
        int Year,
        string PlateNumber,
        int CurrentMileage,
        int? ServiceIntervalMonths,
        int? ServiceIntervalMileage,
        DateTime CreatedAt,
        bool IsActive);

    private sealed record SeedLog(
        int Id,
        int VehicleId,
        DateOnly ServiceDate,
        string Description,
        decimal Cost,
        int MileageAtService);

    private const string VehiclesJson =
"""
[
  {
    "Id": 1,
    "Make": "Tata",
    "Model": "Prima 4023.S",
    "Year": 2019,
    "PlateNumber": "KA-01-AB-1234",
    "CurrentMileage": 158000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 12000,
    "CreatedAt": "2025-07-02T10:00:00",
    "IsActive": true
  },
  {
    "Id": 2,
    "Make": "Mahindra",
    "Model": "Bolero Pickup",
    "Year": 2021,
    "PlateNumber": "MH-12-CD-5678",
    "CurrentMileage": 68000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2021-09-19T10:00:00",
    "IsActive": true
  },
  {
    "Id": 3,
    "Make": "Ashok Leyland",
    "Model": "Dost+",
    "Year": 2022,
    "PlateNumber": "TN-09-EF-4521",
    "CurrentMileage": 45000,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 8000,
    "CreatedAt": "2022-05-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 4,
    "Make": "Toyota",
    "Model": "Innova Crysta",
    "Year": 2023,
    "PlateNumber": "DL-08-GH-7890",
    "CurrentMileage": 32000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2025-01-05T10:00:00",
    "IsActive": true
  },
  {
    "Id": 5,
    "Make": "Force",
    "Model": "Traveller 3350",
    "Year": 2020,
    "PlateNumber": "GJ-05-IJ-3344",
    "CurrentMileage": 96000,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2022-05-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 6,
    "Make": "Tata",
    "Model": "Ace Gold",
    "Year": 2022,
    "PlateNumber": "UP-16-KL-9021",
    "CurrentMileage": 41000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 8000,
    "CreatedAt": "2023-01-05T10:00:00",
    "IsActive": true
  },
  {
    "Id": 7,
    "Make": "Mahindra",
    "Model": "Scorpio Pik Up",
    "Year": 2019,
    "PlateNumber": "RJ-14-MN-6712",
    "CurrentMileage": 121000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2021-02-14T10:00:00",
    "IsActive": true
  },
  {
    "Id": 8,
    "Make": "Eicher",
    "Model": "Pro 2049",
    "Year": 2021,
    "PlateNumber": "TS-07-OP-2298",
    "CurrentMileage": 87000,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2022-07-02T10:00:00",
    "IsActive": true
  },
  {
    "Id": 9,
    "Make": "Tata",
    "Model": "407 Gold SFC",
    "Year": 2018,
    "PlateNumber": "WB-02-QR-5511",
    "CurrentMileage": 172000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2025-09-19T10:00:00",
    "IsActive": true
  },
  {
    "Id": 10,
    "Make": "Maruti Suzuki",
    "Model": "Eeco Cargo",
    "Year": 2023,
    "PlateNumber": "PB-10-ST-8843",
    "CurrentMileage": 28000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 8000,
    "CreatedAt": "2023-06-25T10:00:00",
    "IsActive": true
  },
  {
    "Id": 11,
    "Make": "Tata",
    "Model": "Winger",
    "Year": 2020,
    "PlateNumber": "HR-26-UV-1129",
    "CurrentMileage": 74000,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2025-06-25T10:00:00",
    "IsActive": true
  },
  {
    "Id": 12,
    "Make": "Ashok Leyland",
    "Model": "Boss 1215",
    "Year": 2018,
    "PlateNumber": "KL-07-WX-4470",
    "CurrentMileage": 164000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2025-09-19T10:00:00",
    "IsActive": true
  },
  {
    "Id": 13,
    "Make": "Mahindra",
    "Model": "Furio 7",
    "Year": 2019,
    "PlateNumber": "MP-04-YZ-3387",
    "CurrentMileage": 148500,
    "ServiceIntervalMonths": null,
    "ServiceIntervalMileage": null,
    "CreatedAt": "2024-02-08T10:00:00",
    "IsActive": false
  },
  {
    "Id": 14,
    "Make": "Tata",
    "Model": "Ultra T.16",
    "Year": 2022,
    "PlateNumber": "KA-03-AB-6602",
    "CurrentMileage": 53000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2022-12-01T10:00:00",
    "IsActive": true
  },
  {
    "Id": 15,
    "Make": "BharatBenz",
    "Model": "1617R",
    "Year": 2020,
    "PlateNumber": "MH-04-CD-8815",
    "CurrentMileage": 102000,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2024-12-01T10:00:00",
    "IsActive": true
  },
  {
    "Id": 16,
    "Make": "Tata",
    "Model": "Starbus Ultra",
    "Year": 2021,
    "PlateNumber": "TN-22-EF-2231",
    "CurrentMileage": 61000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2024-06-25T10:00:00",
    "IsActive": true
  },
  {
    "Id": 17,
    "Make": "Mahindra",
    "Model": "Supro Maxi Truck",
    "Year": 2023,
    "PlateNumber": "GJ-01-GH-9954",
    "CurrentMileage": 24000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 8000,
    "CreatedAt": "2023-01-19T10:00:00",
    "IsActive": true
  },
  {
    "Id": 18,
    "Make": "Tata",
    "Model": "Yodha 2.0",
    "Year": 2024,
    "PlateNumber": "UP-32-IJ-1187",
    "CurrentMileage": 18500,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2024-07-02T10:00:00",
    "IsActive": true
  },
  {
    "Id": 19,
    "Make": "Force",
    "Model": "Trax Cruiser",
    "Year": 2019,
    "PlateNumber": "RJ-19-KL-7761",
    "CurrentMileage": 89000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2020-12-01T10:00:00",
    "IsActive": true
  },
  {
    "Id": 20,
    "Make": "Piaggio",
    "Model": "Ape Xtra",
    "Year": 2022,
    "PlateNumber": "TS-11-MN-3456",
    "CurrentMileage": 36500,
    "ServiceIntervalMonths": 3,
    "ServiceIntervalMileage": 5000,
    "CreatedAt": "2023-12-01T10:00:00",
    "IsActive": true
  },
  {
    "Id": 21,
    "Make": "Mahindra",
    "Model": "Jeeto Plus",
    "Year": 2021,
    "PlateNumber": "WB-06-OP-6689",
    "CurrentMileage": 47500,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 8000,
    "CreatedAt": "2022-06-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 22,
    "Make": "Tata",
    "Model": "Intra V30",
    "Year": 2023,
    "PlateNumber": "PB-08-QR-1290",
    "CurrentMileage": 29500,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2025-03-14T10:00:00",
    "IsActive": true
  },
  {
    "Id": 23,
    "Make": "Ashok Leyland",
    "Model": "Partner",
    "Year": 2018,
    "PlateNumber": "HR-51-ST-4402",
    "CurrentMileage": 176000,
    "ServiceIntervalMonths": null,
    "ServiceIntervalMileage": null,
    "CreatedAt": "2024-06-30T10:00:00",
    "IsActive": false
  },
  {
    "Id": 24,
    "Make": "Eicher",
    "Model": "Skyline Pro 3009",
    "Year": 2020,
    "PlateNumber": "KL-15-UV-8873",
    "CurrentMileage": 93500,
    "ServiceIntervalMonths": 4,
    "ServiceIntervalMileage": 9000,
    "CreatedAt": "2020-05-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 25,
    "Make": "Tata",
    "Model": "Signa 2818.T",
    "Year": 2024,
    "PlateNumber": "MP-09-WX-2214",
    "CurrentMileage": 21000,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2026-05-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 26,
    "Make": "Toyota",
    "Model": "Hiace",
    "Year": 2026,
    "PlateNumber": "AP-13-YZ-5590",
    "CurrentMileage": 12500,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 12000,
    "CreatedAt": "2026-05-30T10:00:00",
    "IsActive": true
  },
  {
    "Id": 27,
    "Make": "Eicher",
    "Model": "Pro 3015",
    "Year": 2021,
    "PlateNumber": "DL-01-GH-3390",
    "CurrentMileage": 88450,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 10000,
    "CreatedAt": "2026-08-05T10:00:00",
    "IsActive": true
  },
  {
    "Id": 28,
    "Make": "Mahindra",
    "Model": "Blazo X 35",
    "Year": 2020,
    "PlateNumber": "MH-05-JK-6621",
    "CurrentMileage": 133900,
    "ServiceIntervalMonths": 6,
    "ServiceIntervalMileage": 12000,
    "CreatedAt": "2026-08-12T10:00:00",
    "IsActive": true
  }
]
""";

    private const string MaintenanceLogsJson =
"""
[
  {
    "Id": 1,
    "VehicleId": 1,
    "ServiceDate": "2026-04-22",
    "Description": "General 10,000 km Service",
    "Cost": 5857.06,
    "MileageAtService": 151995
  },
  {
    "Id": 2,
    "VehicleId": 1,
    "ServiceDate": "2026-02-22",
    "Description": "AC System Service",
    "Cost": 2718.68,
    "MileageAtService": 145888
  },
  {
    "Id": 3,
    "VehicleId": 1,
    "ServiceDate": "2025-12-22",
    "Description": "Wheel Alignment",
    "Cost": 602.21,
    "MileageAtService": 139325
  },
  {
    "Id": 4,
    "VehicleId": 1,
    "ServiceDate": "2025-09-22",
    "Description": "Fuel Injector Cleaning",
    "Cost": 3194.99,
    "MileageAtService": 133733
  },
  {
    "Id": 5,
    "VehicleId": 1,
    "ServiceDate": "2025-05-22",
    "Description": "Brake Pad Replacement",
    "Cost": 4281.09,
    "MileageAtService": 126767
  },
  {
    "Id": 6,
    "VehicleId": 2,
    "ServiceDate": "2026-07-22",
    "Description": "Transmission Fluid Change",
    "Cost": 5402.92,
    "MileageAtService": 62239
  },
  {
    "Id": 7,
    "VehicleId": 2,
    "ServiceDate": "2026-03-22",
    "Description": "Fuel Injector Cleaning",
    "Cost": 2654.7,
    "MileageAtService": 54613
  },
  {
    "Id": 8,
    "VehicleId": 2,
    "ServiceDate": "2025-11-22",
    "Description": "Brake Pad Replacement",
    "Cost": 4048.3,
    "MileageAtService": 50329
  },
  {
    "Id": 9,
    "VehicleId": 2,
    "ServiceDate": "2025-08-22",
    "Description": "Suspension Inspection and Repair",
    "Cost": 10798.35,
    "MileageAtService": 46003
  },
  {
    "Id": 10,
    "VehicleId": 3,
    "ServiceDate": "2026-05-22",
    "Description": "Coolant System Flush",
    "Cost": 1792.29,
    "MileageAtService": 40706
  },
  {
    "Id": 11,
    "VehicleId": 3,
    "ServiceDate": "2026-03-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 14421.84,
    "MileageAtService": 34761
  },
  {
    "Id": 12,
    "VehicleId": 3,
    "ServiceDate": "2025-11-22",
    "Description": "Tire Rotation and Balancing",
    "Cost": 1330.96,
    "MileageAtService": 28907
  },
  {
    "Id": 13,
    "VehicleId": 3,
    "ServiceDate": "2025-09-22",
    "Description": "Suspension Inspection and Repair",
    "Cost": 4470.62,
    "MileageAtService": 23520
  },
  {
    "Id": 14,
    "VehicleId": 4,
    "ServiceDate": "2026-06-22",
    "Description": "Wheel Alignment",
    "Cost": 1342.85,
    "MileageAtService": 25696
  },
  {
    "Id": 15,
    "VehicleId": 4,
    "ServiceDate": "2026-04-22",
    "Description": "Brake Pad Replacement",
    "Cost": 4537.16,
    "MileageAtService": 20758
  },
  {
    "Id": 16,
    "VehicleId": 4,
    "ServiceDate": "2026-01-22",
    "Description": "Tire Rotation and Balancing",
    "Cost": 853.18,
    "MileageAtService": 15662
  },
  {
    "Id": 17,
    "VehicleId": 4,
    "ServiceDate": "2025-09-22",
    "Description": "Wheel Alignment",
    "Cost": 712.63,
    "MileageAtService": 8073
  },
  {
    "Id": 18,
    "VehicleId": 4,
    "ServiceDate": "2025-06-22",
    "Description": "General 10,000 km Service",
    "Cost": 4071.49,
    "MileageAtService": 2453
  },
  {
    "Id": 19,
    "VehicleId": 5,
    "ServiceDate": "2026-05-22",
    "Description": "Chassis Lubrication",
    "Cost": 885.59,
    "MileageAtService": 91774
  },
  {
    "Id": 20,
    "VehicleId": 5,
    "ServiceDate": "2026-01-22",
    "Description": "Fuel Injector Cleaning",
    "Cost": 1938.64,
    "MileageAtService": 86539
  },
  {
    "Id": 21,
    "VehicleId": 5,
    "ServiceDate": "2025-11-22",
    "Description": "Timing Belt Replacement",
    "Cost": 5818.18,
    "MileageAtService": 80852
  },
  {
    "Id": 22,
    "VehicleId": 5,
    "ServiceDate": "2025-09-22",
    "Description": "Engine Diagnostics",
    "Cost": 1144.55,
    "MileageAtService": 73725
  },
  {
    "Id": 23,
    "VehicleId": 5,
    "ServiceDate": "2025-07-22",
    "Description": "AC System Service",
    "Cost": 3410.3,
    "MileageAtService": 66881
  },
  {
    "Id": 24,
    "VehicleId": 6,
    "ServiceDate": "2026-04-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 17652.94,
    "MileageAtService": 36033
  },
  {
    "Id": 25,
    "VehicleId": 6,
    "ServiceDate": "2026-02-22",
    "Description": "Engine Diagnostics",
    "Cost": 1990.74,
    "MileageAtService": 30047
  },
  {
    "Id": 26,
    "VehicleId": 6,
    "ServiceDate": "2025-10-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 15223.18,
    "MileageAtService": 23772
  },
  {
    "Id": 27,
    "VehicleId": 6,
    "ServiceDate": "2025-07-22",
    "Description": "Transmission Fluid Change",
    "Cost": 4021.68,
    "MileageAtService": 20116
  },
  {
    "Id": 28,
    "VehicleId": 6,
    "ServiceDate": "2025-04-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 17662.66,
    "MileageAtService": 16903
  },
  {
    "Id": 29,
    "VehicleId": 7,
    "ServiceDate": "2026-05-22",
    "Description": "Exhaust System Repair",
    "Cost": 5849.34,
    "MileageAtService": 114053
  },
  {
    "Id": 30,
    "VehicleId": 8,
    "ServiceDate": "2026-05-22",
    "Description": "Exhaust System Repair",
    "Cost": 7551.71,
    "MileageAtService": 80661
  },
  {
    "Id": 31,
    "VehicleId": 8,
    "ServiceDate": "2026-01-22",
    "Description": "Timing Belt Replacement",
    "Cost": 5175.29,
    "MileageAtService": 75734
  },
  {
    "Id": 32,
    "VehicleId": 9,
    "ServiceDate": "2026-06-22",
    "Description": "Suspension Inspection and Repair",
    "Cost": 3521.33,
    "MileageAtService": 154000
  },
  {
    "Id": 33,
    "VehicleId": 9,
    "ServiceDate": "2026-02-22",
    "Description": "Tire Rotation and Balancing",
    "Cost": 1478.29,
    "MileageAtService": 147678
  },
  {
    "Id": 34,
    "VehicleId": 9,
    "ServiceDate": "2025-12-22",
    "Description": "Air Filter Replacement",
    "Cost": 502.71,
    "MileageAtService": 139497
  },
  {
    "Id": 35,
    "VehicleId": 10,
    "ServiceDate": "2026-05-22",
    "Description": "Puncture Repair and Tire Replacement",
    "Cost": 3327.26,
    "MileageAtService": 23039
  },
  {
    "Id": 36,
    "VehicleId": 10,
    "ServiceDate": "2026-03-22",
    "Description": "Battery Replacement",
    "Cost": 8064.74,
    "MileageAtService": 17631
  },
  {
    "Id": 37,
    "VehicleId": 11,
    "ServiceDate": "2026-06-22",
    "Description": "General 10,000 km Service",
    "Cost": 3984.02,
    "MileageAtService": 68731
  },
  {
    "Id": 38,
    "VehicleId": 11,
    "ServiceDate": "2026-04-22",
    "Description": "Wheel Alignment",
    "Cost": 521.03,
    "MileageAtService": 64869
  },
  {
    "Id": 39,
    "VehicleId": 11,
    "ServiceDate": "2025-12-22",
    "Description": "Chassis Lubrication",
    "Cost": 698.2,
    "MileageAtService": 60327
  },
  {
    "Id": 40,
    "VehicleId": 12,
    "ServiceDate": "2026-06-22",
    "Description": "Brake Pad Replacement",
    "Cost": 4722.76,
    "MileageAtService": 160224
  },
  {
    "Id": 41,
    "VehicleId": 13,
    "ServiceDate": "2025-06-22",
    "Description": "Battery Replacement",
    "Cost": 7196.17,
    "MileageAtService": 135547
  },
  {
    "Id": 42,
    "VehicleId": 13,
    "ServiceDate": "2025-02-22",
    "Description": "Chassis Lubrication",
    "Cost": 925.4,
    "MileageAtService": 126870
  },
  {
    "Id": 43,
    "VehicleId": 14,
    "ServiceDate": "2026-07-22",
    "Description": "AC System Service",
    "Cost": 2756.6,
    "MileageAtService": 49103
  },
  {
    "Id": 44,
    "VehicleId": 14,
    "ServiceDate": "2026-04-22",
    "Description": "Brake Pad Replacement",
    "Cost": 4089.44,
    "MileageAtService": 43191
  },
  {
    "Id": 45,
    "VehicleId": 15,
    "ServiceDate": "2026-06-22",
    "Description": "Wheel Alignment",
    "Cost": 1300.59,
    "MileageAtService": 95868
  },
  {
    "Id": 46,
    "VehicleId": 16,
    "ServiceDate": "2026-06-22",
    "Description": "General 10,000 km Service",
    "Cost": 4060.73,
    "MileageAtService": 55304
  },
  {
    "Id": 47,
    "VehicleId": 16,
    "ServiceDate": "2026-04-22",
    "Description": "General 10,000 km Service",
    "Cost": 4499.23,
    "MileageAtService": 50164
  },
  {
    "Id": 48,
    "VehicleId": 17,
    "ServiceDate": "2026-07-22",
    "Description": "Headlight and Wiring Check",
    "Cost": 1954.04,
    "MileageAtService": 20993
  },
  {
    "Id": 49,
    "VehicleId": 17,
    "ServiceDate": "2026-05-22",
    "Description": "Suspension Inspection and Repair",
    "Cost": 4496.8,
    "MileageAtService": 14707
  },
  {
    "Id": 50,
    "VehicleId": 17,
    "ServiceDate": "2026-02-22",
    "Description": "Battery Replacement",
    "Cost": 8823.25,
    "MileageAtService": 9536
  },
  {
    "Id": 51,
    "VehicleId": 17,
    "ServiceDate": "2025-12-22",
    "Description": "Brake Fluid Replacement",
    "Cost": 802.59,
    "MileageAtService": 5662
  },
  {
    "Id": 52,
    "VehicleId": 17,
    "ServiceDate": "2025-09-22",
    "Description": "General 10,000 km Service",
    "Cost": 4641.0,
    "MileageAtService": 1376
  },
  {
    "Id": 53,
    "VehicleId": 18,
    "ServiceDate": "2026-04-22",
    "Description": "Battery Replacement",
    "Cost": 5983.54,
    "MileageAtService": 14366
  },
  {
    "Id": 54,
    "VehicleId": 18,
    "ServiceDate": "2026-02-22",
    "Description": "Headlight and Wiring Check",
    "Cost": 791.44,
    "MileageAtService": 7994
  },
  {
    "Id": 55,
    "VehicleId": 18,
    "ServiceDate": "2025-11-22",
    "Description": "Brake Pad Replacement",
    "Cost": 3786.2,
    "MileageAtService": 3760
  },
  {
    "Id": 56,
    "VehicleId": 18,
    "ServiceDate": "2025-07-22",
    "Description": "Exhaust System Repair",
    "Cost": 3365.88,
    "MileageAtService": 500
  },
  {
    "Id": 57,
    "VehicleId": 18,
    "ServiceDate": "2025-03-22",
    "Description": "Coolant System Flush",
    "Cost": 1309.63,
    "MileageAtService": 500
  },
  {
    "Id": 58,
    "VehicleId": 19,
    "ServiceDate": "2025-06-22",
    "Description": "Brake Fluid Replacement",
    "Cost": 943.86,
    "MileageAtService": 83000
  },
  {
    "Id": 59,
    "VehicleId": 19,
    "ServiceDate": "2025-02-22",
    "Description": "Chassis Lubrication",
    "Cost": 1035.07,
    "MileageAtService": 80496
  },
  {
    "Id": 60,
    "VehicleId": 20,
    "ServiceDate": "2026-06-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 8451.11,
    "MileageAtService": 32836
  },
  {
    "Id": 61,
    "VehicleId": 20,
    "ServiceDate": "2026-02-22",
    "Description": "Suspension Inspection and Repair",
    "Cost": 5390.53,
    "MileageAtService": 30193
  },
  {
    "Id": 62,
    "VehicleId": 20,
    "ServiceDate": "2025-12-22",
    "Description": "Transmission Fluid Change",
    "Cost": 4100.29,
    "MileageAtService": 26818
  },
  {
    "Id": 63,
    "VehicleId": 20,
    "ServiceDate": "2025-10-22",
    "Description": "General 10,000 km Service",
    "Cost": 5984.64,
    "MileageAtService": 24799
  },
  {
    "Id": 64,
    "VehicleId": 21,
    "ServiceDate": "2026-05-22",
    "Description": "Exhaust System Repair",
    "Cost": 3958.6,
    "MileageAtService": 43827
  },
  {
    "Id": 65,
    "VehicleId": 22,
    "ServiceDate": "2026-05-22",
    "Description": "Coolant System Flush",
    "Cost": 1901.1,
    "MileageAtService": 25183
  },
  {
    "Id": 66,
    "VehicleId": 22,
    "ServiceDate": "2026-01-22",
    "Description": "Transmission Fluid Change",
    "Cost": 4640.87,
    "MileageAtService": 18702
  },
  {
    "Id": 67,
    "VehicleId": 23,
    "ServiceDate": "2024-09-22",
    "Description": "Engine Diagnostics",
    "Cost": 2402.29,
    "MileageAtService": 166095
  },
  {
    "Id": 68,
    "VehicleId": 24,
    "ServiceDate": "2026-07-22",
    "Description": "Headlight and Wiring Check",
    "Cost": 933.17,
    "MileageAtService": 87310
  },
  {
    "Id": 69,
    "VehicleId": 25,
    "ServiceDate": "2026-05-22",
    "Description": "Clutch Plate Replacement",
    "Cost": 12064.91,
    "MileageAtService": 16667
  },
  {
    "Id": 70,
    "VehicleId": 25,
    "ServiceDate": "2026-02-22",
    "Description": "Brake Pad Replacement",
    "Cost": 2113.81,
    "MileageAtService": 8959
  },
  {
    "Id": 71,
    "VehicleId": 26,
    "ServiceDate": "2026-07-22",
    "Description": "Wheel Alignment",
    "Cost": 1271.12,
    "MileageAtService": 8271
  },
  {
    "Id": 72,
    "VehicleId": 26,
    "ServiceDate": "2026-03-22",
    "Description": "Coolant System Flush",
    "Cost": 2385.97,
    "MileageAtService": 1326
  },
  {
    "Id": 73,
    "VehicleId": 26,
    "ServiceDate": "2025-11-22",
    "Description": "Headlight and Wiring Check",
    "Cost": 714.5,
    "MileageAtService": 500
  },
  {
    "Id": 74,
    "VehicleId": 27,
    "ServiceDate": "2026-08-03",
    "Description": "Engine Overhaul",
    "Cost": 38420.55,
    "MileageAtService": 86120
  },
  {
    "Id": 75,
    "VehicleId": 27,
    "ServiceDate": "2026-08-06",
    "Description": "Clutch Plate Replacement",
    "Cost": 15230.40,
    "MileageAtService": 86210
  },
  {
    "Id": 76,
    "VehicleId": 27,
    "ServiceDate": "2026-08-10",
    "Description": "Turbocharger Replacement",
    "Cost": 27180.90,
    "MileageAtService": 86750
  },
  {
    "Id": 77,
    "VehicleId": 27,
    "ServiceDate": "2026-08-14",
    "Description": "Brake Pad Replacement",
    "Cost": 4872.25,
    "MileageAtService": 87100
  },
  {
    "Id": 78,
    "VehicleId": 27,
    "ServiceDate": "2026-08-18",
    "Description": "AC System Service",
    "Cost": 3105.75,
    "MileageAtService": 87660
  },
  {
    "Id": 79,
    "VehicleId": 27,
    "ServiceDate": "2026-08-21",
    "Description": "General 10,000 km Service",
    "Cost": 5230.68,
    "MileageAtService": 88120
  },
  {
    "Id": 80,
    "VehicleId": 28,
    "ServiceDate": "2026-08-04",
    "Description": "Transmission Rebuild",
    "Cost": 42650.30,
    "MileageAtService": 130450
  },
  {
    "Id": 81,
    "VehicleId": 28,
    "ServiceDate": "2026-08-08",
    "Description": "Suspension Inspection and Repair",
    "Cost": 11872.45,
    "MileageAtService": 131020
  },
  {
    "Id": 82,
    "VehicleId": 28,
    "ServiceDate": "2026-08-12",
    "Description": "Fuel Injector Cleaning",
    "Cost": 3420.85,
    "MileageAtService": 131680
  },
  {
    "Id": 83,
    "VehicleId": 28,
    "ServiceDate": "2026-08-17",
    "Description": "Wheel Alignment",
    "Cost": 1420.60,
    "MileageAtService": 132250
  },
  {
    "Id": 84,
    "VehicleId": 28,
    "ServiceDate": "2026-08-21",
    "Description": "Coolant System Flush",
    "Cost": 2180.35,
    "MileageAtService": 133400
  }
]
""";
}
