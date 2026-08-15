using FluentValidation;
using FleetTrack.Api.Dtos.Vehicles;

namespace FleetTrack.Api.Dtos.Vehicles;

public class VehicleUpdateDtoValidator : AbstractValidator<VehicleUpdateDto>
{
    public VehicleUpdateDtoValidator()
    {
        RuleFor(v => v.Make)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(v => v.Model)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(v => v.Year)
            .InclusiveBetween(1980, DateTime.UtcNow.Year + 1);

        RuleFor(v => v.ServiceIntervalMonths)
            .GreaterThan(0)
            .When(v => v.ServiceIntervalMonths.HasValue);

        RuleFor(v => v.ServiceIntervalMileage)
            .GreaterThan(0)
            .When(v => v.ServiceIntervalMileage.HasValue);
    }
}
