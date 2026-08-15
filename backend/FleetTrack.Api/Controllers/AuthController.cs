using FleetTrack.Api.Dtos.Auth;
using FleetTrack.Api.Models;
using FleetTrack.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return Ok(BuildResponse(user));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }

        return Ok(BuildResponse(user));
    }

    private AuthResponse BuildResponse(ApplicationUser user)
    {
        var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var minutes)
            ? minutes
            : 1440;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        return new AuthResponse(
            _tokenService.GenerateToken(user),
            expiresAt,
            new UserDto(user.Id, user.Email ?? string.Empty, user.FullName));
    }
}
