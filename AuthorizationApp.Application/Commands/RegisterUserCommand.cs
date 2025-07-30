using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Commands
{
    public class RegisterUserCommand
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        public string Email { get; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; }

        public RegisterUserCommand(string name, string email, string password)
        {
            Name = name;
            Email = email;
            Password = password;
        }
    }
}
