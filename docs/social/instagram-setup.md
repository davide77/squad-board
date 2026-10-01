# Connecting @gafferboard to Claude

One-off setup, about 15 minutes. After it, Claude can read the account and publish posts and stories you have approved, through the small server in [tools/instagram-mcp/server.mjs](../../tools/instagram-mcp/server.mjs).

The server has no third-party code. The token stays on this Mac in `~/.config/gafferboard/instagram.json`, outside the repo, readable only by you.

## 1. Make the account Professional

In the Instagram app, as @gafferboard:

1. Settings and activity, then **Account type and tools**, then **Switch to professional account**.
2. Pick **Business**. Category: **App page**.
3. Contact: davide@gafferboard.com. Leave the phone number off.

No Facebook Page is needed.

## 2. Create the Meta app

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) and log in (your own Facebook login is fine, the app is private).
2. **Create app**. Name: `Gafferboard Social`. Contact email: davide@gafferboard.com.
3. Use case: **Manage messaging and content on Instagram**. Skip the business portfolio if asked. Create.
4. In the app, open **Instagram**, then **API setup with Instagram login**.
5. Under **Generate access tokens**, click **Add account** and log in as @gafferboard. Allow the permissions it asks for (basic, content publish, comments, insights).
   - If it says the account is not a tester: **App roles**, then **Roles**, then **Add people**, **Instagram Tester**, `gafferboard`. Then in the Instagram app: Settings, **Website permissions**, **Apps and websites**, **Tester invites**, accept. Back to step 5.
6. Next to @gafferboard, click **Generate token** and copy it. It starts `IG`.

**If Add account keeps opening "Add people to your app"** (it did for us on 1 October 2026), skip the button and use the script instead. Add `https://gafferboard.com/` under **4. Set up Instagram business login**, then **OAuth redirect URIs** (the Instagram one, not Facebook Login for Business), then run:

```bash
bash tools/instagram-mcp/get-token.sh
```

It prints a login link, takes the address you land on and the **Instagram app secret** (the one beside the Instagram app ID on the API setup page, not App settings, Basic), and saves a 60-day token. That replaces step 3 below.

The app stays in **Development** mode. No App Review is needed, because it only ever posts to an account that has a role on the app.

## 3. Save the token

In Terminal, paste this, press Enter, then paste the token (it will not show) and press Enter again:

```bash
mkdir -p ~/.config/gafferboard && read -rs TOKEN && printf '{"access_token":"%s"}\n' "$TOKEN" > ~/.config/gafferboard/instagram.json && chmod 600 ~/.config/gafferboard/instagram.json && unset TOKEN && echo saved
```

## 4. Turn it on in Claude Code

1. Reload the VS Code window (Command Palette, **Developer: Reload Window**) or start a new Claude Code session in this repo.
2. Claude Code asks whether to trust the project MCP server **instagram** from `.mcp.json`. Approve it.
3. Ask Claude: "check the Instagram account". It should come back with @gafferboard and the follower count.

**Do not allow-list the `ig_publish_*` tools.** Every publish should ask you first. The read tools (`ig_account`, `ig_recent_media`, `ig_stories`, `ig_insights`, `ig_comments`) are safe to allow.

## 5. Keep it alive

The token lasts 60 days. `/instagram-daily` refreshes it once a week with `ig_refresh_token`. If it ever lapses, run `bash tools/instagram-mcp/get-token.sh` again.

## How a post gets out

Instagram only takes media from a public URL. So:

1. The images are rendered into `public/social/<slug>/`.
2. They are committed and pushed. Vercel puts them live at `https://gafferboard.com/social/<slug>/01.jpg`.
3. The server checks each URL is live and is a JPEG, then publishes.

Limits: 100 API posts in 24 hours, JPEG only, 10 slides per carousel, 5 hashtags per caption, 2,200 characters per caption. Story stickers, music, collab invites and the AI label can only be added in the app.
