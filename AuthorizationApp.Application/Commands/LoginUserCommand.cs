using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Commands
{
    public class LoginUserCommand
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        public string Email { get; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; }

        public LoginUserCommand(string email, string password)
        {
            Email = email;
            Password = password;
        }
    }
}
