using AuthorizationApp.Application.Commands;
using AuthorizationApp.Application.Interfaces;
using AuthorizationApp.Application.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthorizationApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;

        public UsersController(IUserService userService)
        {
            this.userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
        {
            var users = await this.userService.GetUsersAsync(query);
            return Ok(users);
        }

        [HttpPost("block")]
        public async Task<IActionResult> BlockUsers([FromBody] BlockUsersCommand command)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await this.userService.BlockUsersAsync(command);
            return NoContent();
        }

        [HttpPost("unblock")]
        public async Task<IActionResult> UnblockUsers([FromBody] UnblockUsersCommand command)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await this.userService.UnblockUsersAsync(command);
            return NoContent();
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUsers([FromBody] DeleteUsersCommand command)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await this.userService.DeleteUsersAsync(command);
            return NoContent();
        }
    }
}
