using FluentValidation;
using FleetTrack.Api.Dtos.MaintenanceLogs;

namespace FleetTrack.Api.Dtos.MaintenanceLogs;

public class MaintenanceLogUpdateDtoValidator : AbstractValidator<MaintenanceLogUpdateDto>
{
    public MaintenanceLogUpdateDtoValidator()
    {
        RuleFor(l => l.ServiceDate)
            .NotEmpty();

        RuleFor(l => l.Description)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(l => l.Cost)
            .GreaterThanOrEqualTo(0);

        RuleFor(l => l.MileageAtService)
            .GreaterThanOrEqualTo(0);
    }
}