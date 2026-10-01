#!/usr/bin/env bash
# Gets a 60-day Instagram token for @gafferboard without the Meta dashboard's "Add account" button.
#
#   bash tools/instagram-mcp/get-token.sh
#
# 1. Prints the Instagram login link. Open it, log in as @gafferboard, allow everything.
# 2. Instagram sends the browser to https://gafferboard.com/?code=...  Copy the address bar.
# 3. Paste it here, then the Instagram app secret (from the dashboard, "Show"). Neither is echoed.
# 4. The code is swapped for a long-lived token, saved to ~/.config/gafferboard/instagram.json.
#
# The redirect address must be listed in the app under "Set up Instagram business login",
# exactly as below, trailing slash included.
set -euo pipefail

APP_ID="1397023315962691"
REDIRECT="https://gafferboard.com/"
SCOPES="instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_insights"
CONFIG="$HOME/.config/gafferboard/instagram.json"

# Asks until it gets a non-empty answer. Input is hidden, so it says how much arrived. A paste that
# ends in a line break would otherwise answer the next question with nothing.
ask() {
  local prompt="$1" answer=""
  while [ -z "$answer" ]; do
    read -rsp "$prompt" answer
    echo >&2
    answer="${answer//[[:space:]]/}"
    if [ -z "$answer" ]; then echo "   Nothing came through. Paste again." >&2; fi
  done
  echo "   Got ${#answer} characters." >&2
  printf '%s' "$answer"
}

enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$1"; }

echo
echo "1. Open this link, log in as @gafferboard and allow everything:"
echo
echo "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${APP_ID}&redirect_uri=$(enc "$REDIRECT")&response_type=code&scope=${SCOPES}"
echo
echo "2. You land on gafferboard.com. Copy the whole address from the address bar."
LANDED=$(ask "   Paste it here and press Enter (hidden): ")
CODE=$(python3 -c 'import sys,urllib.parse as u;q=u.parse_qs(u.urlparse(sys.argv[1].strip()).query);print(q.get("code",[""])[0].split("#")[0])' "$LANDED")
if [ -z "$CODE" ]; then
  echo "   No code in that address. Run the script again and copy the address straight after allowing." >&2
  exit 1
fi

SECRET=$(ask "3. Paste the Instagram app secret (dashboard, Show) and press Enter (hidden): ")

SHORT=$(curl -sS -X POST https://api.instagram.com/oauth/access_token \
  -F "client_id=${APP_ID}" -F "client_secret=${SECRET}" -F "grant_type=authorization_code" \
  -F "redirect_uri=${REDIRECT}" -F "code=${CODE}")
SHORT_TOKEN=$(python3 -c 'import sys,json;d=json.loads(sys.argv[1]);print(d.get("access_token",""))' "$SHORT")
if [ -z "$SHORT_TOKEN" ]; then
  echo "   Instagram said: $(python3 -c 'import sys,json;d=json.loads(sys.argv[1]);print(d.get("error_message") or d.get("error",{}).get("message") or d)' "$SHORT")" >&2
  echo "   A code works once and for an hour. Run the script again for a fresh one." >&2
  exit 1
fi

LONG=$(curl -sS -G https://graph.instagram.com/access_token \
  --data-urlencode "grant_type=ig_exchange_token" --data-urlencode "client_secret=${SECRET}" \
  --data-urlencode "access_token=${SHORT_TOKEN}")
unset SECRET

mkdir -p "$(dirname "$CONFIG")"
umask 077
python3 - "$LONG" "$CONFIG" <<'PY'
import sys, json, datetime
d = json.loads(sys.argv[1])
if "access_token" not in d:
    sys.exit("   Could not swap for a 60-day token: %s" % (d.get("error", {}).get("message") or d))
expires = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=int(d.get("expires_in", 0)))
with open(sys.argv[2], "w") as f:
    json.dump({"access_token": d["access_token"], "expires_at": expires.isoformat()}, f, indent=2)
    f.write("\n")
print("4. Saved. Token good until %s." % expires.strftime("%d %B %Y"))
PY
