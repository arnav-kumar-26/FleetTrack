using FleetTrack.Api.Models;

namespace FleetTrack.Api.Services;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user);
}
