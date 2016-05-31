using System;
using System.Web.Mvc;
using Octokit;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Azimo.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult BasicAuthForm()
        {
            return View();
        }

        public async Task<string> Login(string username, string password)
        {
            try
            {
                var client = new GitHubClient(new ProductHeaderValue("Azimo"));

                var basicAuth = new Credentials(username, password);
                client.Credentials = basicAuth;

                User user = await client.User.Current();

                // Do not return sensitive data
                JObject returndUserDate = new JObject(
                    new JProperty("username", user.Name),
                    new JProperty("login", user.Login),
                    new JProperty("publicRepos", user.PublicRepos)
                );

                JObject output = new JObject(
                    new JProperty("status", "Ok"),
                    new JProperty("data", returndUserDate)
                );

                return JsonConvert.SerializeObject(output);
            }
            catch (Exception ex)
            {
                JObject output = new JObject(
                    new JProperty("status", "Error"),
                    new JProperty("data", new JObject())
                );

                return JsonConvert.SerializeObject(output);
            }
        }

        public async Task<string> ListRepos(string username)
        {
            try
            {
                var client = new GitHubClient(new ProductHeaderValue("Azimo"));

                var basicAuth = new Credentials(username, password);
                client.Credentials = basicAuth;

                User user = await client.User.Current();

                // Do not return sensitive data
                JObject returndUserDate = new JObject(
                    new JProperty("username", user.Name),
                    new JProperty("login", user.Login),
                    new JProperty("publicRepos", user.PublicRepos)
                );

                JObject output = new JObject(
                    new JProperty("status", "Ok"),
                    new JProperty("data", returndUserDate)
                );

                return JsonConvert.SerializeObject(output);
            }
            catch (Exception ex)
            {
                JObject output = new JObject(
                    new JProperty("status", "Error"),
                    new JProperty("data", new JObject())
                );

                return JsonConvert.SerializeObject(output);
            }
        }
    }
}