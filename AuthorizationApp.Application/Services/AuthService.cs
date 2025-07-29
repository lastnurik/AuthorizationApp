using AuthorizationApp.Application.DTO;
using AuthorizationApp.Application.Interfaces;
using AuthorizationApp.Domain.Entities;
using AuthorizationApp.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository userRepository;
        private readonly IPasswordHasher passwordHasher;
        private readonly IJwtTokenGenerator jwtTokenGenerator;

        public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            this.userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            this.passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
            this.jwtTokenGenerator = jwtTokenGenerator ?? throw new ArgumentNullException(nameof(jwtTokenGenerator));
        }

        public async Task<UserLoginResponseDto?> LoginAsync(UserLoginDto userLogin)
        {
            var user = await this.userRepository.GetByEmailAsync(userLogin.Email);

            if (user == null)
            {
                return null;
            }

            var isPasswordValid = this.passwordHasher.VerifyHashedPassword(user.PasswordHash, userLogin.Password);
            if (!isPasswordValid)
            {
                return null;
            }

            if (user.IsBlocked)
            {
                return null;
            }

            user.UpdateLastLogin();
            await this.userRepository.UpdateAsync(user.Id, user);

            var token = this.jwtTokenGenerator.GenerateToken(user);

            return new UserLoginResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsBlocked = user.IsBlocked,
                LastLogin = user.LastLogin,
                Token = token
            };
        }

        public async Task<UserDto?> RegisterAsync(UserRegistrationDto userRegistration)
        {
            var existingUser = await this.userRepository.GetByEmailAsync(userRegistration.Email);

            if (existingUser != null)
            {
                return null;
            }

            var hashedPassword = this.passwordHasher.HashPassword(userRegistration.Password);

            var newUser = new User(hashedPassword, userRegistration.Name, userRegistration.Email);

            await this.userRepository.AddAsync(newUser);

            return new UserDto
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Email = newUser.Email,
                IsBlocked = newUser.IsBlocked,
                LastLogin = newUser.LastLogin,
            };
        }
    }
}
