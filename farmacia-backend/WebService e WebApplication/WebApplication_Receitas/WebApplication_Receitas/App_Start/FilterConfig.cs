﻿using System.Web;
using System.Web.Mvc;

namespace WebApplication_Receitas
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
