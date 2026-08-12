export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
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
