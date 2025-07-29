using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthorizationApp.Application.Queries
{
    public class GetUsersQuery
    {
        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string? SortBy { get; set; }

        public bool SortDescending { get; set; } = false;

        public string? SearchTerm { get; set; }
        
        public bool? IsBlockedFilter { get; set; }
    }
}
