# Deployment Notes

## Web Auth URLs

Set `SITE_URL` to the exact origin you are testing or deploying, for example:

```text
SITE_URL=http://localhost:3010
SITE_URL=https://your-vercel-project.vercel.app
```

Supabase Auth must allow the callback URLs that the app passes to
`signInWithOtp`:

```text
http://localhost:3000/auth/callback
http://localhost:3000/en/auth/callback
http://localhost:3010/auth/callback
http://localhost:3010/en/auth/callback
https://your-vercel-project.vercel.app/auth/callback
https://your-vercel-project.vercel.app/en/auth/callback
```

If you test locally on port 3010, use `SITE_URL=http://localhost:3010` and add the 3010
redirect URLs above. If you test on port 3000, use `SITE_URL=http://localhost:3000` and add
the 3000 equivalents.

If you use Vercel preview deployments, add the preview callback origin you test with as well.
Do not put Supabase service-role keys or other secrets in public `NEXT_PUBLIC_` variables.

## Supabase Auth Email Template

Supabase only sends one Magic Link template per project, so the production template defaults to
Spanish with a short English line.

In Supabase Dashboard, go to Auth -> Email Templates -> Magic Link and use the HTML from
`supabase/templates/magic-link.html`.

The template intentionally supports both login paths:

- Keep `{{ .ConfirmationURL }}` in the button link. Supabase replaces it with the one-time PKCE
  magic link, which redirects to the app callback with `?code=...`.
- Include `{{ .Token }}` as the manual code. This is the email OTP that
  `verifyOtp({ type: 'email' })` expects on `/login/verify`.
- Do not show `{{ .TokenHash }}` as a manual code. It is for custom token-hash confirmation links,
  and this app's callback route does not use that flow.

The web form accepts numeric email codes from 6 to 10 digits and lets Supabase decide
whether the token is valid.

There is no app-level allowed-email list. Any email address accepted by Supabase Auth can request
login and view the app after authentication.
