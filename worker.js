export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth") {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUri = url.origin + "/api/callback";
      const authorizeUrl =
        "https://github.com/login/oauth/authorize?client_id=" +
        clientId +
        "&scope=repo,user&redirect_uri=" +
        encodeURIComponent(redirectUri);
      return Response.redirect(authorizeUrl, 302);
    }

    if (url.pathname === "/api/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("No code provided", { status: 400 });
      }

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: code,
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          "Error: " + (tokenData.error_description || tokenData.error),
          { status: 400 }
        );
      }

      const message =
        "authorization:github:success:" +
        JSON.stringify({
          token: tokenData.access_token,
          provider: "github",
        });

      const html =
        "<!DOCTYPE html><html><head><title>Authorizing...</title></head><body><script>" +
        "(function(){" +
        "function receiveMessage(e){" +
        "window.opener.postMessage(" +
        JSON.stringify(message) +
        ", e.origin);" +
        'window.removeEventListener("message", receiveMessage, false);' +
        "}" +
        'window.addEventListener("message", receiveMessage, false);' +
        'window.opener.postMessage("authorizing:github", "*");' +
        "})();" +
        "</script></body></html>";

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(
      "This is an internal OAuth authentication service for LoanHelpline Pune's admin panel.",
      { headers: { "Content-Type": "text/html" } }
    );
  },
};
