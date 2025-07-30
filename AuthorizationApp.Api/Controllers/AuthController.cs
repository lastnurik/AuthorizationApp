using AuthorizationApp.Application.Commands;
using AuthorizationApp.Application.DTO;
using AuthorizationApp.Application.Interfaces;
using AuthorizationApp.Application.Queries;
using AuthorizationApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthorizationApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new RegisterUserCommand(dto.Name, dto.Email, dto.Password);

            var userDto = await this.authService.RegisterAsync(command);

            if (userDto == null)
            {
                return Conflict(new { message = "User with this email already exists." });
            }

            return CreatedAtAction(nameof(Register), new { id = userDto.Id }, userDto);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new LoginUserCommand(dto.Email, dto.Password);

            var loginResponse = await this.authService.LoginAsync(command);

            if (loginResponse == null)
            {
                return Unauthorized(new { message = "Invalid credentials or user is blocked." });
            }

            return Ok(loginResponse);
        }
    }
}
