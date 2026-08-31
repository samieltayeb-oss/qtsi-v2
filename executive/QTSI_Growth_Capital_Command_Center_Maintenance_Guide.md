# QTSI Growth Capital Command Center™
## Maintenance & Operations Guide

This guide is for the technical team or web administrator responsible for maintaining the Executive Portal.

---

### 1. Rotating the Executive Password
The portal uses Vercel Edge Middleware for security. The password is not hardcoded anywhere in the codebase.
**To change the password:**
1. Log into your Vercel Dashboard and navigate to the `qtsi-website` project.
2. Go to **Settings > Environment Variables**.
3. Edit the value for `EXEC_PASSWORD`.
4. (Optional but recommended) Edit the value for `EXEC_TOKEN_SECRET` to invalidate all active sessions immediately.
5. Click **Save**.
6. You **must redeploy** the application for the environment variables to take effect (Go to Deployments > Redeploy).

### 2. Updating Funding Deadlines and Statuses
Funding programs (like RAII or Alberta Innovates) frequently open and close intakes.
1. Open `/executive/index.html` in your code editor.
2. Search for the program name (e.g., `NRC IRAP`).
3. You can change the badge from `<span class="exec-pill exec-pill--open">OPEN</span>` to `<span class="exec-pill" style="background:#ff4d4f;color:#fff;">CLOSED</span>`.
4. Update the **Updates & Policy Changes** section at the bottom of the HTML to log the change.
5. Commit and push to GitHub to deploy.

### 3. Modifying or Adding Vault Documents
The Document Vault is located in `/executive/vault/`.
**To update an existing PDF/HTML narrative document:**
- Directly edit the corresponding `.html` file inside `/executive/vault/`.
- Ensure you do not remove the `<link rel="stylesheet" href="/css/vault.css">` reference, as this handles the print-to-PDF formatting.

**To update an Excel file:**
- Overwrite the existing `.xlsx` file in the `/executive/vault/` directory with your new version.

**To add a new document:**
1. Place the new file in `/executive/vault/`.
2. Edit `/executive/index.html` and add a new `<a class="exec-module-card">` link pointing to the file in the "Executive Document Vault" section.

### 4. Periodic Verification Schedule
To ensure the portal remains trustworthy, the administrator should perform the following checks:
- **Monthly:** Verify the "This Week's Executive Priorities" are still aligned with Manav's actual goals.
- **Quarterly:** Click all links in the "Official Resources" section to ensure the government URLs have not 404'd. Review the "Immediate Funding Opportunities" to confirm they are still accepting applications.

### 5. Safe Redeployment
Vercel is linked to your GitHub repository.
1. Make your changes locally or via GitHub's web editor.
2. Run `git add .`, `git commit -m "update message"`, and `git push`.
3. Vercel will automatically build and deploy the changes within 10-15 seconds.
4. No build scripts need to be manually executed for the static content.
