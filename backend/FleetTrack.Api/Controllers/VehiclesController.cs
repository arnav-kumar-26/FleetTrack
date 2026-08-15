using FleetTrack.Api.Dtos.Vehicles;
using FleetTrack.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.Api.Controllers;

[ApiController]
[Route("api/vehicles")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _vehicleService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    [HttpGet("due-for-service")]
    public async Task<IActionResult> GetDueForService()
    {
        return Ok(await _vehicleService.GetDueForServiceAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VehicleCreateDto dto)
    {
        var vehicle = await _vehicleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] VehicleUpdateDto dto)
    {
        var vehicle = await _vehicleService.UpdateAsync(id, dto);
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Archive(int id)
    {
        var archived = await _vehicleService.ArchiveAsync(id);
        return archived ? NoContent() : NotFound();
    }

    [HttpGet("{id:int}/maintenance-logs")]
    public async Task<IActionResult> GetMaintenanceLogs(int id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);
        if (vehicle is null)
        {
            return NotFound();
        }

        return Ok(await _vehicleService.GetMaintenanceLogsForVehicleAsync(id));
    }
}
