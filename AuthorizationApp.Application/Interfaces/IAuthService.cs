using AuthorizationApp.Application.Commands;
using AuthorizationApp.Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto?> RegisterAsync(RegisterUserCommand userRegistration);

        Task<UserLoginResponseDto?> LoginAsync(LoginUserCommand userLogin);

        Task<bool> UpdateUserProfileAsync(UpdateUserCommand command);

        Task<bool> UpdateUserPasswordAsync(UpdatePasswordCommand command);
    }
}
