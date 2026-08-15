namespace FleetTrack.Api.Dtos.Auth;

public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
