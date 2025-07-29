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

        public async Task<IEnumerable<UserDto>> GetUsersAsync(GetUsersQuery query)
        {
            var users = await this.userRepository.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                users = users.Where(u => u.Name.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                                         u.Email.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase));
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

            return pagedUsers.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                IsBlocked = u.IsBlocked,
                LastLogin = u.LastLogin,
            }).ToList();
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
    }
}
