using OpenIddict.Abstractions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace MCPTestSite;

/// <summary>
/// Registers the MCP Worker as an OpenIdDict authorization_code client
/// so the hosted MCP server can authenticate via Umbraco's backoffice.
/// </summary>
public class McpOAuthComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification,
            RegisterMcpClientHandler>();
    }
}

public class RegisterMcpClientHandler
    : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
{
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IConfiguration _configuration;

    public RegisterMcpClientHandler(
        IOpenIddictApplicationManager applicationManager,
        IConfiguration configuration)
    {
        _applicationManager = applicationManager;
        _configuration = configuration;
    }

    public async Task HandleAsync(
        UmbracoApplicationStartingNotification notification,
        CancellationToken cancellationToken)
    {
        const string clientId = "umbraco-back-office-mcp";

        // Remove any existing registration (e.g. client_credentials from the UI)
        // so we can re-register with authorization_code grant + redirect URI.
        var existing = await _applicationManager.FindByClientIdAsync(clientId, cancellationToken);
        if (existing is not null)
        {
            await _applicationManager.DeleteAsync(existing, cancellationToken);
        }

        var descriptor = new OpenIddictApplicationDescriptor
        {
            ClientId = clientId,
            ClientType = OpenIddictConstants.ClientTypes.Public,
            DisplayName = "Umbraco MCP Server",
            RedirectUris =
            {
                new Uri("http://localhost:8787/callback"),
                new Uri("http://localhost:8788/callback"),
            },
            PostLogoutRedirectUris =
            {
                new Uri("http://localhost:8787/logout-callback"),
                new Uri("http://localhost:8788/logout-callback"),
            },
            Permissions =
            {
                OpenIddictConstants.Permissions.Endpoints.Authorization,
                OpenIddictConstants.Permissions.Endpoints.Token,
                OpenIddictConstants.Permissions.Endpoints.Revocation,
                OpenIddictConstants.Permissions.Endpoints.EndSession,
                OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
                OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                OpenIddictConstants.Permissions.ResponseTypes.Code,
            }
        };

        // Add tunnel callback URL if configured (set by infrastructure/tunnels.sh)
        var tunnelUrl = _configuration["MCP_TUNNEL_URL"];
        if (!string.IsNullOrEmpty(tunnelUrl))
        {
            var baseUrl = tunnelUrl.TrimEnd('/');
            descriptor.RedirectUris.Add(new Uri($"{baseUrl}/callback"));
            descriptor.PostLogoutRedirectUris.Add(new Uri($"{baseUrl}/logout-callback"));
        }

        await _applicationManager.CreateAsync(descriptor, cancellationToken);
    }
}
