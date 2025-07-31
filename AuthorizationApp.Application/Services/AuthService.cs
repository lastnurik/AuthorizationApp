using AuthorizationApp.Application.Commands;
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

        public async Task<UserLoginResponseDto?> LoginAsync(LoginUserCommand userLogin)
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

        public async Task<UserDto?> RegisterAsync(RegisterUserCommand userRegistration)
        {
            var existingUser = await this.userRepository.GetByEmailAsync(userRegistration.Email);

            if (existingUser != null)
            {
                return null;
            }

            var hashedPassword = this.passwordHasher.HashPassword(userRegistration.Password);

            var newUser = new User(userRegistration.Name, userRegistration.Email, hashedPassword);

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

        public async Task<bool> UpdateUserProfileAsync(UpdateUserCommand command)
        {
            var user = await this.userRepository.GetByIdAsync(command.Id);
            if (user == null)
            {
                return false;
            }

            var existingUserWithEmail = await this.userRepository.GetByEmailAsync(command.Email);
            if (existingUserWithEmail != null && existingUserWithEmail.Id != user.Id)
            {
                return false;
            }

            user.Name = command.Name;
            user.Email = command.Email;

            return await this.userRepository.UpdateAsync(user.Id, user);
        }

        public async Task<bool> UpdateUserPasswordAsync(UpdatePasswordCommand command)
        {
            var user = await this.userRepository.GetByIdAsync(command.UserId);
            if (user == null)
            {
                return false;
            }

            var isCurrentPasswordValid = this.passwordHasher.VerifyHashedPassword(user.PasswordHash, command.CurrentPassword);
            if (!isCurrentPasswordValid)
            {
                return false;
            }

            var newHashedPassword = this.passwordHasher.HashPassword(command.NewPassword);
            user.UpdatePasswordHash(newHashedPassword);

            var success = await this.userRepository.UpdateAsync(user.Id, user);

            if (success)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
