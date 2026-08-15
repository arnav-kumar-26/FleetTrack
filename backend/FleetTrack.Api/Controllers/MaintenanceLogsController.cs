using FleetTrack.Api.Dtos.MaintenanceLogs;
using FleetTrack.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.Api.Controllers;

[ApiController]
[Route("api/maintenance-logs")]
[Authorize]
public class MaintenanceLogsController : ControllerBase
{
    private readonly IMaintenanceLogService _maintenanceLogService;

    public MaintenanceLogsController(IMaintenanceLogService maintenanceLogService)
    {
        _maintenanceLogService = maintenanceLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int? vehicleId, DateOnly? fromDate, DateOnly? toDate)
    {
        return Ok(await _maintenanceLogService.GetAllAsync(vehicleId, fromDate, toDate));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _maintenanceLogService.GetByIdAsync(id);
        return log is null ? NotFound() : Ok(log);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MaintenanceLogCreateDto dto)
    {
        var log = await _maintenanceLogService.CreateAsync(dto);
        return log is null ? BadRequest("Vehicle not found.") : CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] MaintenanceLogUpdateDto dto)
    {
        var log = await _maintenanceLogService.UpdateAsync(id, dto);
        return log is null ? NotFound() : Ok(log);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _maintenanceLogService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}