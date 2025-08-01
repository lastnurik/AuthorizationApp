using AuthorizationApp.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthorizationApp.Api.Filters
{
    public class UserStatusCheckFilter : IAsyncActionFilter
    {
        private readonly IUserRepository _userRepository;

        public UserStatusCheckFilter(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.HttpContext.User.Identity.IsAuthenticated)
            {
                var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int userId))
                {
                    var user = await _userRepository.GetByIdAsync(userId);

                    if (user == null)
                    {
                        context.Result = new UnauthorizedObjectResult(new { message = "User not found." });
                        return;
                    }

                    if (user.IsBlocked)
                    {
                        context.Result = new ForbidResult();
                        return;
                    }
                }
            }

            await next();
        }
    }
}
