using OpenIddict.Abstractions;
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

    public RegisterMcpClientHandler(IOpenIddictApplicationManager applicationManager)
    {
        _applicationManager = applicationManager;
    }

    public async Task HandleAsync(
        UmbracoApplicationStartingNotification notification,
        CancellationToken cancellationToken)
    {
        const string clientId = "umbraco-mcp-cms-hosted";

        var existing = await _applicationManager.FindByClientIdAsync(clientId, cancellationToken);
        if (existing is not null)
        {
            await _applicationManager.DeleteAsync(existing, cancellationToken);
        }

        var descriptor = new OpenIddictApplicationDescriptor
        {
            ClientId = clientId,
            ClientType = OpenIddictConstants.ClientTypes.Public,
            DisplayName = "Umbraco MCP Server (E2E Test)",
            RedirectUris =
            {
                new Uri("http://localhost:8787/callback"),
                new Uri("http://127.0.0.1:8787/callback"),
            },
            PostLogoutRedirectUris =
            {
                new Uri("http://localhost:8787/logout-callback"),
                new Uri("http://127.0.0.1:8787/logout-callback"),
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

        await _applicationManager.CreateAsync(descriptor, cancellationToken);
    }
}
