﻿using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using Octokit;
using System.Threading.Tasks;
using System.Collections.Generic;


namespace Azimo.Controllers
{
    public class HomeController : Controller
    {
        readonly GitHubClient client = new GitHubClient(new ProductHeaderValue("Azimo"));
        private static Credentials currentCredentials;

        public ActionResult Index()
        {
            HttpCookie cookie = Request.Cookies["AzimoTestCookie"];
            string username;

            if (cookie != null)
            {
                JObject data = JsonConvert.DeserializeObject<JObject>(cookie.Value);

                username = data.Value<string>("username");

                currentCredentials = new Credentials(data.Value<string>("username"), data.Value<string>("password"));
                client.Credentials = currentCredentials;
            }
            else
            {
                username = null;
            }

            ViewBag.Username = username;

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

        public ActionResult UnstarRepoDialog()
        {
            return View();
        }

        public async Task<string> Login(string username, string password)
        {
            try
            {
                currentCredentials = new Credentials(username, password);
                client.Credentials = currentCredentials;

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

                // Set cookie
                SetCookie(username, password);

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

        public ActionResult LogOut()
        {
            HttpCookie cookie = Request.Cookies["AzimoTestCookie"];

            cookie.Expires = new DateTime(1990);

            Response.Cookies.Add(cookie);

            return RedirectToAction("Index");
        }

        public async Task<string> GetUserData(string username)
        {
            User user = null;
            SearchRepositoryResult result = null;
            client.Credentials = currentCredentials;

            try
            {
                user = await client.User.Get(username);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new JObject(
                new JProperty("message", "User error")
                ));
            }

            try
            {
                var customRequest = new SearchRepositoriesRequest() { User = username };
                result = await client.Search.SearchRepo(customRequest);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new JObject(
                new JProperty("message", "Repository search error")
                ));
            }

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

            JObject userData = new JObject(
                new JProperty("login", user.Login),
                new JProperty("username", user.Name),
                new JProperty("email", user.Email),
                new JProperty("publicRepos", user.PublicRepos)
            );

            return JsonConvert.SerializeObject(new JObject(
                new JProperty("message", "Ok"),
                new JProperty("userData", userData),
                new JProperty("repositories", repositoriesArray)
            ));
        }

        public async Task<string> StarRepo(string username, string name)
        {
            client.Credentials = currentCredentials;

            try
            {
                bool starred = await client.Activity.Starring.CheckStarred(username, name);

                if (starred)
                {
                    return "Repo already starred";
                }

                bool result = await client.Activity.Starring.StarRepo(username, name);

                return result == true ? "Ok" : "Unable to star repo";
            }
            catch (Exception ex)
            {
                return "Server error";
            }
        }

        public async Task<string> UnstarRepo(string username, string name)
        {
            client.Credentials = currentCredentials;

            try
            {
                bool starred = await client.Activity.Starring.CheckStarred(username, name);

                if (!starred)
                {
                    return "Repo not starred";
                }

                bool result = await client.Activity.Starring.RemoveStarFromRepo(username, name);

                return result == true ? "Ok" : "Unable to unstar repo";
            }
            catch (Exception ex)
            {
                return "Server error";
            }
        }

        public bool SetCookie(string username, string password)
        {
            HttpCookie cookie = new HttpCookie("AzimoTestCookie");

            cookie.Value = JsonConvert.SerializeObject(new JObject(new JProperty("username", username), new JProperty("password", password)));

            cookie.Expires = DateTime.Now.AddHours(1);

            Response.Cookies.Add(cookie);

            return true;
        }

        public Dictionary<string, string> GetCookie()
        {
            HttpCookie cookie = Request.Cookies["AzimoTestCookie"];

            Dictionary<string, string> output = new Dictionary<string, string>();

            if (cookie == null)
            {
                output.Add("message", "No cookie");
            }
            else
            {
                output.Add("message", "Cookie exists");
                output.Add("value", cookie.Value);
            }

            return output;
        }
    }
}