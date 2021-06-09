using System.Linq;
using System.Security.Authentication;
using System.Threading;
using System.Threading.Tasks;
using Atlassian.Jira;
using JiraOauth.OAuthTokenHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<HomeController> _logger;
        private readonly string _url;
        private readonly string _consumerKey;

        private string _consumerSecret = ""; 

        public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var privateKey = System.IO.File.ReadAllText("jira_privatekey.pem");
            var decoder = new OpenSSL.PrivateKeyDecoder.OpenSSLPrivateKeyDecoder();
            var keyInfo = decoder.Decode(privateKey);
            this._consumerSecret = keyInfo.ToXmlString(true);

            _url = _configuration["AppSettings:Jira:Url"];
            _consumerKey = _configuration["AppSettings:Jira:ConsumerKey"];

        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("pong");
        }

        [HttpGet("login")]
        public async Task<IActionResult> LoginAsync() {

            var settings = new JiraOAuthRequestTokenSettings(_url, _consumerKey, _consumerSecret, "http://localhost:4200");

            var requestToken = await JiraOAuthTokenHelper.GenerateRequestTokenAsync(settings);

            if (requestToken == null)
                throw new AuthenticationException("Failed retrieving RequestToken");

            return Ok(
                new { 
                    url=requestToken.AuthorizeUri, 
                    token=requestToken.OAuthToken, 
                    secret=requestToken.OAuthTokenSecret 
                });
        }

        [HttpGet("access")]
        public async Task<IActionResult> AccessAsync() {

            var token = Request.Headers["token"];
            var tokenSecret = Request.Headers["secret"];
            var tokenVerifier = Request.Headers["verifier"];

            var settings = new JiraOAuthAccessTokenSettings(_url, _consumerKey, _consumerSecret, token, tokenSecret, tokenVerifier);
            var accessToken = await JiraOAuthTokenHelper.ObtainAccessTokenAsync(settings, CancellationToken.None);

            return Ok(new {access=accessToken});

        }

        [HttpGet("result")]
        public async Task<IActionResult> ResultAsync() {

            var tokenAccess = Request.Headers["access"];
            var tokenSecret = Request.Headers["secret"];            

            var jira = Jira.CreateOAuthRestClient(_url, _consumerKey, _consumerSecret, tokenAccess, tokenSecret);

            var result = await jira.Issues.GetIssuesFromJqlAsync("project = SEP");
            var vm = result.Select(issue => new
            {
                Created = issue.Created, Description = issue.Description, Title = issue.Summary,
                Reporter = issue.Reporter, Type = issue.Type.Name, Priority = issue.Priority.Name,
                Key = issue.Key.ToString()
            });

            return Ok(vm);

        }

    }
}
