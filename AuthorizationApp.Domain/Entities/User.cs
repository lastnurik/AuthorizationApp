using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthorizationApp.Domain.Entities
{
    public class User
    {
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string PasswordHash { get; set; }

        public bool IsBlocked { get; private set; } = false;

        public DateTime? LastLogin { get; private set; }

        public User(string name, string email, string passwordHash)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            IsBlocked = false;
            LastLogin = null;
        }

        private User() { }

        public void Block() => IsBlocked = true;

        public void Unblock() => IsBlocked = false;

        public void UpdateLastLogin() => LastLogin = DateTime.UtcNow;

        public void UpdatePasswordHash(string newPasswordHash)
        {
            if (string.IsNullOrWhiteSpace(newPasswordHash))
                throw new ArgumentException("Password hash cannot be empty.", nameof(newPasswordHash));
            PasswordHash = newPasswordHash;
        }
    }
}
