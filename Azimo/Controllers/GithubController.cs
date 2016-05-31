using System;
using System.Web.Mvc;
using Octokit;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Azimo.Controllers
{
    public class GithubController : Controller
    {
        readonly GitHubClient client = new GitHubClient(new ProductHeaderValue("Azimo"));

        public async Task<string> Login(string username, string password)
        {
            try
            {
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

        public async Task<string> GetUserData(string username)
        {
            var request = new SearchRepositoriesRequest() { User = username };

            var result = await client.Search.SearchRepo(request);

            JArray repositoriesArray = new JArray();

            foreach (Repository repository in result.Items)
            {
                repositoriesArray.Add(
                    new JObject(
                        new JProperty("name", repository.Name),
                        new JProperty("createdAt", repository.CreatedAt),
                        new JProperty("updatedAt", repository.UpdatedAt),
                        new JProperty("language", repository.Language),
                        new JProperty("stars", repository.StargazersCount),
                        new JProperty("forks", repository.ForksCount)
                    )
                );
            }

            User user = await client.User.Get(username);

            JObject userData = new JObject(
                new JProperty("login", user.Login),
                new JProperty("username", user.Name),
                new JProperty("email", user.Email),
                new JProperty("publicRepos", user.PublicRepos)
            );

            return JsonConvert.SerializeObject(new JObject(
                new JProperty("userData", userData),
                new JProperty("repositories", repositoriesArray)
            ));
        }
    }
}