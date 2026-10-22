# Setup guide (one-time)

You can do these steps from your phone, but a laptop is easier for the SQL and repository setup.

## Step 1 — Create the shared database
1. Open https://supabase.com and create/sign in to an account.
2. Create a new project named `bcsc-job-tracker`. Save the database password somewhere safe.
3. Wait for the project to finish provisioning.
4. Open **SQL Editor** → **New query**.
5. Open `supabase-schema.sql` from this project, copy all its contents into the SQL editor, and click **Run**. This creates the shared jobs table and access policies.
6. Open **Project Settings → API** (sometimes labelled API Keys). Copy the **Project URL** and the **publishable key** (or legacy `anon` key). Never use the `service_role` or secret key in the website.

## Step 2 — Create four individual logins
1. In Supabase, open **Authentication → Users**.
2. Choose **Add user** / **Create new user** and create one email/password login for each of the four people.
3. Use four unique email addresses and strong, unique passwords. Share each password privately, not in a public group.
4. For a controlled team app, turn off public sign-ups in **Authentication → Sign In / Providers** if the setting is available. Users should sign in, not create their own accounts.

## Step 3 — Connect the app
1. Open `config.js` in a text editor.
2. Replace `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE` with the Project URL and `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE` with the publishable/anon key. Keep the quotes.
3. Save `config.js`.

The publishable/anon key is designed for browser use only when RLS is configured. Never paste a service-role/secret key into `config.js`.

## Step 4 — Publish free with GitHub Pages
1. Sign in at https://github.com and create a repository named `bcsc-job-tracker`.
2. For easiest setup, choose **Public**. GitHub Pages on free plans generally requires a public repository; do not put private company documents or secrets in the repository. `config.js` contains only the public project URL and publishable key, not a database password.
3. Upload all files in this folder to the repository root, including `index.html`, `app.js`, `styles.css`, `config.js`, `manifest.webmanifest`, `supabase-schema.sql`, and this guide.
4. In the repository, open **Settings → Pages**. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
5. Wait for the deployment and open the URL GitHub Pages shows.

Alternative: host the same static files on another static host you prefer. If using a public GitHub repository, remember the source code is public. Row Level Security and the login requirement protect job data; do not store confidential secrets in the repository.

## Step 5 — Test with the team
1. Open the published website and sign in with one of the four accounts.
2. Add a test job, save it, and verify it appears in the job list.
3. Open the app on another device/browser and sign in with another account. Verify that the same job is visible and changes appear.
4. Test editing, filters, and CSV export.
5. Delete the test job from Supabase Table Editor if you do not want it to remain.

## How to use
- Tap **+ Add job** to enter a job.
- Use **Edit** to update an existing job.
- Use the search box or dropdowns to filter jobs.
- Export CSV for a backup or for Excel.

## Important security notes
- This starter app gives every signed-in user full access to all jobs, as requested. There is no per-user technician restriction.
- Only create the four accounts you intend to authorize.
- Do not expose a Supabase service-role or secret key.
- Keep a separate backup/export of important operational records.
- This starter app has not been independently security-audited. Test with non-sensitive sample jobs before using it for critical business records.
