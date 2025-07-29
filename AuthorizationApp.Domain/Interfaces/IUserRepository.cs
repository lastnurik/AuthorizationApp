using AuthorizationApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Domain.Interfaces
{
    /// <summary>
    /// Defines the contract for data access operations related to User entities.
    /// This interface is part of the Domain layer, ensuring that the core business logic
    /// is independent of specific data persistence technologies.
    /// </summary>
    public interface IUserRepository
    {
        Task<int> AddAsync(User user);

        Task<User?> GetByIdAsync(int id);

        Task<User?> GetByEmailAsync(string email);

        Task<IEnumerable<User>> GetAllAsync();

        Task<bool> UpdateAsync(int id, User user);

        Task<bool> DeleteAsync(int id);
    }
}
