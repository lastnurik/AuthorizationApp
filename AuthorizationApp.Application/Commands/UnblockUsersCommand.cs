using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Commands
{
    public class UnblockUsersCommand
    {
        [Required(ErrorMessage = "At least one User ID is required to unblock.")]
        [MinLength(1, ErrorMessage = "At least one User ID is required to unblock.")]
        public IEnumerable<int> UserIds { get; }

        public UnblockUsersCommand(IEnumerable<int> userIds)
        {
            UserIds = userIds ?? new List<int>();
        }
    }
}
