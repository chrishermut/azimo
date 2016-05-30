using System.Web.Mvc;
using Octokit;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Azimo.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public async Task<string> Login()
        {
            var client = new GitHubClient(new ProductHeaderValue("Azimo"));

            var basicAuth = new Credentials("chris.hermut@gmail.com", "werty1234");
            client.Credentials = basicAuth;

            User user = await client.User.Current();

            return JsonConvert.SerializeObject(user);
        }
    }
}