using System;
using System.Web.Mvc;
using Octokit;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web.Security;

namespace Azimo.Controllers
{
    public class HomeController : Controller
    {
        readonly GitHubClient client = new GitHubClient(new ProductHeaderValue("Azimo"));

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult BasicAuthForm()
        {
            return View();
        }

        public ActionResult Panel()
        {
            return View();
        }
    }
}