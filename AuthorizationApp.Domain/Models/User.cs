using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Domain.Models
{
    public class User
    {
        public int Id { get; }

        public string Name { get; }

        public string Email { get; }

        public string PasswordHash { get; }

        public bool IsBlocked { get; private set; }

        public DateTime LastLogin { get; private set; }

        public void Block() => IsBlocked = true;

        public void Unblock() => IsBlocked = false;

        public void UpdateLastLogin() => LastLogin = DateTime.UtcNow;
    }
}
