How to open the PR for branch `website-fixes-2026-07`

Option A — recommended (GitHub CLI `gh`)

1. Ensure `gh` is authenticated (run `gh auth login`).
2. From the repo root run:

```bash
# fetch & ensure branch is up-to-date
git fetch origin
git checkout website-fixes-2026-07
git pull origin website-fixes-2026-07

# create a PR (interactive prompt)
gh pr create --base main --head website-fixes-2026-07 --title "chore: Turnstile worker + fallback handling, CSS utilities, inline-style refactor, 404 SEO" --body-file PR_BODY.md --web
```

`--web` opens the PR in your browser so you can review and submit; remove `--web` to create directly from CLI.

Option B — curl (GitHub API)

1. Create a personal access token (PAT) with `repo` scope and set it in your shell: `export GITHUB_TOKEN=ghp_xxx` (Windows PowerShell: `$env:GITHUB_TOKEN = 'ghp_xxx'`).
2. Use this curl (replace owner/repo):

```bash
curl -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<owner>/<repo>/pulls \
  -d '{"title":"chore: Turnstile worker + fallback handling, CSS utilities, inline-style refactor, 404 SEO","head":"website-fixes-2026-07","base":"main","body":"'"$(sed ':a;N;$!ba;s/"/\\"/g' PR_BODY.md)"'"}'
```

Notes
- `PR_BODY.md` is prepared in the repo root. Edit it if you want changes before creating the PR.
- I verified `_headers` and `a0f8f0c4f3f7427ab33ffdfddfa28717.txt` exist in the repo root.

If you want, I can try to run `gh pr create` for you locally — but I need an authenticated environment or for you to run the commands above and paste the result. Alternatively, I can open a draft PR description file in `.github/` for you to review; tell me which you prefer.