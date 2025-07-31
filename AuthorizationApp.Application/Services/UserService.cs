using AuthorizationApp.Application.Commands;
using AuthorizationApp.Application.DTO;
using AuthorizationApp.Application.Interfaces;
using AuthorizationApp.Application.Queries;
using AuthorizationApp.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository userRepository;

        public UserService(IUserRepository userRepository)
        {
            this.userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        }

        public async Task BlockUsersAsync(BlockUsersCommand command)
        {
            foreach (var userId in command.UserIds)
            {
                var user = await this.userRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    user.Block();
                    await this.userRepository.UpdateAsync(userId, user);
                }
            }
        }

        public async Task DeleteUsersAsync(DeleteUsersCommand command)
        {
            foreach (var userId in command.UserIds)
            {
                await this.userRepository.DeleteAsync(userId);
            }
        }

        public async Task<UserDto> GetUserByIdAsync(int userId)
        {
            var user = await this.userRepository.GetByIdAsync(userId);

            return new UserDto 
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsBlocked = user.IsBlocked,
                LastLogin = user.LastLogin,
            };

        }

        public async Task<PaginatedResult<UserDto>> GetUsersAsync(GetUsersQuery query)
        {
            var users = (await this.userRepository.GetAllAsync()).AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var searchTermLower = query.SearchTerm.ToLower();
                users = users.Where(u => u.Name.ToLower().Contains(searchTermLower) ||
                                         u.Email.ToLower().Contains(searchTermLower));
            }

            if (query.IsBlockedFilter.HasValue)
            {
                users = users.Where(u => u.IsBlocked == query.IsBlockedFilter.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.SortBy))
            {
                var sortByLower = query.SortBy.ToLower();
                switch (sortByLower)
                {
                    case "name":
                        users = query.SortDescending ? users.OrderByDescending(u => u.Name) : users.OrderBy(u => u.Name);
                        break;
                    case "email":
                        users = query.SortDescending ? users.OrderByDescending(u => u.Email) : users.OrderBy(u => u.Email);
                        break;
                    case "lastlogin":
                        users = query.SortDescending ? users.OrderByDescending(u => u.LastLogin) : users.OrderBy(u => u.LastLogin);
                        break;
                    default:
                        users = users.OrderBy(u => u.Id);
                        break;
                }
            }
            else
            {
                users = users.OrderBy(u => u.Id);
            }

            var pagedUsers = users
               .Skip((query.PageNumber - 1) * query.PageSize)
               .Take(query.PageSize);

            var paginatedResult = new PaginatedResult<UserDto>
            {
                Items = pagedUsers.Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    IsBlocked = u.IsBlocked,
                    LastLogin = u.LastLogin
                }).ToList(),
                TotalCount = users.Count(),
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return paginatedResult;
        }

        public async Task UnblockUsersAsync(UnblockUsersCommand command)
        {
            foreach (var userId in command.UserIds)
            {
                var user = await this.userRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    user.Unblock();
                    await this.userRepository.UpdateAsync(userId, user);
                }
            }
        }

        public async Task<UserDto?> UpdateUserAsync(UpdateUserCommand command)
        {
            var user = await this.userRepository.GetByIdAsync(command.Id);
            if (user == null)
            {
                return null;
            }

            if (user.Email.ToLower() != command.Email.ToLower())
            {
                var existingUserWithNewEmail = await this.userRepository.GetByEmailAsync(command.Email);
                if (existingUserWithNewEmail != null && existingUserWithNewEmail.Id != user.Id)
                {
                    return null;
                }
            }

            await this.userRepository.UpdateAsync(command.Id, user);

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                IsBlocked = user.IsBlocked,
                LastLogin = user.LastLogin,
            };
        }
    }
}
