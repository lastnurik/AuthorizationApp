using AuthorizationApp.Application.Commands;
using AuthorizationApp.Application.DTO;
using AuthorizationApp.Application.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Interfaces
{
    public interface IUserService
    {
        /// <summary>
        /// Retrieves a list of users based on the provided query.
        /// </summary>
        /// <param name="query">The query object for filtering and pagination (if implemented).</param>
        /// <returns>A Task representing the asynchronous operation, returning an enumerable collection of UserDto.</returns>
        Task<PaginatedResult<UserDto>> GetUsersAsync(GetUsersQuery query);

        Task<UserDto> GetUserByIdAsync(int userId);

        /// <summary>
        /// Blocks one or more users asynchronously.
        /// </summary>
        /// <param name="command">The command containing the IDs of users to block.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task BlockUsersAsync(BlockUsersCommand command);

        /// <summary>
        /// Unblocks one or more users asynchronously.
        /// </summary>
        /// <param name="command">The command containing the IDs of users to unblock.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task UnblockUsersAsync(UnblockUsersCommand command);

        /// <summary>
        /// Deletes one or more users asynchronously.
        /// </summary>
        /// <param name="command">The command containing the IDs of users to delete.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task DeleteUsersAsync(DeleteUsersCommand command);
    }
}
