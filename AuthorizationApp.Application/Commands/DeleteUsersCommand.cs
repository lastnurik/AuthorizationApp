using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Commands
{
    public class DeleteUsersCommand
    {
        [Required(ErrorMessage = "At least one User ID is required to delete.")]
        [MinLength(1, ErrorMessage = "At least one User ID is required to delete.")]
        public IEnumerable<int> UserIds { get; }

        public DeleteUsersCommand(IEnumerable<int> userIds)
        {
            UserIds = userIds ?? new List<int>();
        }
    }
}
