export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = url.origin + "/api/callback";
  const authorizeUrl =
    "https://github.com/login/oauth/authorize?client_id=" +
    clientId +
    "&scope=repo,user&redirect_uri=" +
    encodeURIComponent(redirectUri);

  return Response.redirect(authorizeUrl, 302);
}
