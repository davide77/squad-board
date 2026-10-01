---
name: instagram-daily
description: Daily Instagram routine for @gafferboard - check the account and yesterday's numbers, draft today's post or stories from the playbook, render the images, show Davide, and on his OK deploy and publish. Mondays add the weekly review. Use when Davide says /instagram-daily, "today's Instagram", "post to Instagram", "draft a story" or similar.
---

# Instagram, daily

You run @gafferboard's Instagram with Davide. You draft, he approves, then you publish. Nothing goes out without his OK on that exact post.

## 0. Read first, every time

1. [docs/social/instagram-playbook.md](../../../docs/social/instagram-playbook.md): story, voice, pillars, weekly rhythm, red lines, queue.
2. [docs/social/log.md](../../../docs/social/log.md): what already went out. Do not repeat a post or a hook from the last four weeks.
3. [brand.md](../../../brand.md): voice and hard rules. No long dashes. British English. Players never gendered.
4. If the post is in Davide's first person: `~/.claude/email-voice.md`.

## 1. Check the account

Call `mcp__instagram__ig_account` and `mcp__instagram__ig_recent_media`. If the server is missing or returns "No Instagram token", stop and point Davide at [docs/social/instagram-setup.md](../../../docs/social/instagram-setup.md).

For each post from the last 7 days with no numbers in the log yet, call `mcp__instagram__ig_insights` and fill in reach, saves and shares. Check `mcp__instagram__ig_comments` on the last three posts and list any that need Davide to reply. Never reply as him.

## 2. Work out today's slot

From the weekly rhythm in the playbook (section 7), by today's weekday and the UK time. Take the next idea from the queue (section 10) that fits the slot, or write a new one in the right pillar. Check the season calendar (section 11) for a dated hook this week.

If today is Monday, also do the weekly review (step 6).

## 3. Draft

1. Write a spec in `docs/social/posts/<YYYY-MM-DD>-<slug>.json`. Copy the shape of the launch specs: `format` is `feed` or `story`, slides use the layouts `cover`, `text`, `list`, `screen`, `end`, every slide has `alt`. Feed posts have a `caption`.
2. Copy rules: the hook goes in the first 125 characters, one call to action, at most five hashtags from the bank, one speaker per post (the Gaffer in Hairdryer, or Davide signed "- Davide"). Every slide still says something useful with the attitude taken out.
3. Render: `node tools/social/render.mjs docs/social/posts/<file>.json`. Then `pkill -f gb-social` to clear any stray Chrome.
4. Look at every rendered slide yourself (Read the JPEGs). Fix wrapping, crowding or a word that reads wrong, and render again.
5. Check facts. Any number about formats, ages or rules must match englandfootball.com or the constants in `src/constants/football.ts`. Never a real child, player name, squad or other club.

## 4. Show Davide

One message: the slides (as a contact sheet or the files), the caption, the alt text, when it should go out, and why this post today in one line. Then stop and wait. If he edits, redo step 3.

If the post needs something the API cannot do (a link sticker, music, a collab invite, the AI label), say so and give him the files and caption to post from the app instead.

## 5. Publish, on his OK only

1. Commit only the post's files: `git add docs/social/posts/<file>.json public/social/<slug>/` and commit with a plain message (`Instagram: <slug>`), no AI co-author line. Push to `main`. His approval of the post covers this commit and push, nothing else in the working tree.
2. Wait for the deploy: poll `curl -sI https://gafferboard.com/social/<slug>/01.jpg` until it returns 200 and `image/jpeg` (use Monitor with an until-loop, not sleep).
3. Publish with the matching tool: `mcp__instagram__ig_publish_carousel`, `ig_publish_photo`, `ig_publish_reel` or `ig_publish_story` (one call per story frame, in order). URLs are `https://gafferboard.com/social/<slug>/NN.jpg`.
4. Add a line to the Posts table in `docs/social/log.md` with the date, slug, type and permalink. Commit the log with the next post, not on its own.

## 6. Mondays: weekly review

Under "Weekly reviews" in the log, newest first: the week's posts with reach, saves and shares, the best and the worst and a guess at why, follower change, and one change for next week. Compare against the targets in section 13 of the playbook. Ask Davide for the week's team sheet count and Instagram referrals from Vercel Analytics if you cannot read them yourself.

## 7. Weekly: the token

If the config's `expires_at` is missing or less than 50 days away, call `mcp__instagram__ig_refresh_token`.

## Never

- Publish anything Davide has not approved in this session.
- Post a photo or video of a real child, a real player's name or a real team sheet.
- Use a long dash, more than five hashtags, or engagement bait ("tag a coach", "comment YES").
- Reply to comments or DMs as Davide.
