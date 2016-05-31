using System.Web.Mvc;

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

        public ActionResult Panel()
        {
            return View();
        }
    }
}