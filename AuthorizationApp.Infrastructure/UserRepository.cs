using AuthorizationApp.Domain.Entities;
using AuthorizationApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext context;

        public UserRepository(AppDbContext context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<int> AddAsync(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            this.context.Users.Add(user);
            await context.SaveChangesAsync();
            return user.Id;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var user = await this.context.Users.FindAsync(id);
            return user;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Email cannot be null or empty.", nameof(email));
            }

            var user = await this.context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            return user;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            var users = await this.context.Users.AsNoTracking().ToListAsync();
            return users;
        }

        public async Task<bool> UpdateAsync(int id, User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var existingUser = await this.context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return false;
            }

            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.PasswordHash = user.PasswordHash;

            return await this.context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await this.context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            this.context.Users.Remove(user);
            return await this.context.SaveChangesAsync() > 0;
        }
    }
}
