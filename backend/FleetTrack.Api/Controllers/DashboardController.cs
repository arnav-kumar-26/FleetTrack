using FleetTrack.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        return Ok(await _dashboardService.GetSummaryAsync());
    }

    [HttpGet("cost-trend")]
    public async Task<IActionResult> GetCostTrend([FromQuery] int? months)
    {
        return Ok(await _dashboardService.GetCostTrendAsync(months ?? 6));
    }
}