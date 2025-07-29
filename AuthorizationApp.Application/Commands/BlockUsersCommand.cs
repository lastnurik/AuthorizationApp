using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Commands
{
    public class BlockUsersCommand
    {
        [Required(ErrorMessage = "At least one User ID is required to block.")]
        [MinLength(1, ErrorMessage = "At least one User ID is required to block.")]
        public IEnumerable<int> UserIds { get; }

        public BlockUsersCommand(IEnumerable<int> userIds)
        {
            UserIds = userIds ?? new List<int>(); // Ensure it's never null
        }
    }
}
