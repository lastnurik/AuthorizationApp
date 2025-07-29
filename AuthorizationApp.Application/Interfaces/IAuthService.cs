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
        Task<UserDto?> RegisterAsync(UserRegistrationDto userRegistration);

        Task<UserLoginResponseDto?> LoginAsync(UserLoginDto userLogin);
    }
}
