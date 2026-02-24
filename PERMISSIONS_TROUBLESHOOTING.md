# The Ultimate Deployment & Permissions Guide

This guide provides the definitive steps to solve recurring deployment and permission errors with Firebase App Hosting. If your login fails or build logs show errors about missing secrets, following these steps carefully will fix the issue.

The root cause is almost always that the services running your application do not have permission to read the secrets they need from Google Secret Manager. There are **two** separate services that need this permission:

1.  **The Build Service:** This service runs the `next build` command. It needs secrets during the build (e.g., to fetch jobs for the jobs page).
2.  **The Runtime Service:** This service runs your live application after it's built. It needs secrets to log in, send emails, etc.

You must grant permission to **both**.

---

### Step 1: Ensure All Secrets Exist in Secret Manager

First, verify that you have created all 5 required secrets as individual entries in the Google Cloud Secret Manager.

1.  Go to the **Secret Manager** page in the Google Cloud Console for your `mlsc-30` project.
2.  You should see the following 5 names in your secrets list. If any are missing, create them now. **Do NOT use quotes in the secret value.**

*   `JWT_SECRET`
*   `GOOGLE_API_KEY`
*   `GMAIL_USER`
*   `GMAIL_APP_PASSWORD`
*   `JSEARCH_API_KEY`

---

### Step 2: Grant Permissions to the Runtime Service

This is the service that runs your live application.

1.  Go to the **IAM & Admin** page in the Google Cloud Console.
2.  Click the **"+ GRANT ACCESS"** button.
3.  In the **"New principals"** text box, paste the exact service account name for the runtime service:
    ```
    firebase-app-hosting-compute@mlsc-30.iam.gserviceaccount.com
    ```
4.  In the **"Select a role"** dropdown, type `Secret Manager Secret Accessor` and select it.
5.  Click **"SAVE"**. You might see a message that the principal already exists; this is okay.

---

### Step 3: Grant Permissions to the Build Service

This is the most commonly missed step and is crucial for fixing build errors.

1.  Stay on the **IAM & Admin** page.
2.  On the right side of the page, find and check the box that says **"Include Google-provided role grants"**. This is very important as it reveals hidden service accounts.
3.  A longer list will appear. Find the principal that ends with **`@cloudbuild.gserviceaccount.com`**. Its name will be "Cloud Build Service Account".
4.  Click the **pencil icon** (Edit principal) for that row.
5.  Click **"ADD ANOTHER ROLE"**.
6.  In the **"Select a role"** dropdown, type `Secret Manager Secret Accessor` and select it.
7.  Click **"SAVE"**.

You have now granted permission to both the build and runtime services.

---

### Step 4: Grant Storage Admin Permission (For Deleting Files)

The "Failed to Delete" error in the Home Page Management section is because the application does not have permission to delete files from Firebase Storage.

1.  Go back to the **IAM & Admin** page.
2.  Find the **runtime** service account again (`firebase-app-hosting-compute@...`).
3.  Click the **pencil icon** to edit its roles.
4.  Click **"ADD ANOTHER ROLE"**.
5.  In the role dropdown, type `Storage Object Admin` and select it. This role allows creating, reading, and deleting files.
6.  Click **"SAVE"**.

---

### Step 5: Re-deploy the Application

After completing all the permission steps above, trigger a new deployment:

1.  Make a small change to any file in your project (like adding a space).
2.  Commit and push the change to your GitHub repository.

```bash
git add .
git commit -m "Fix permissions and re-deploy"
git push
```

This new deployment will now have all the necessary permissions for both the build and runtime, and all features, including login and deleting, should work correctly.
