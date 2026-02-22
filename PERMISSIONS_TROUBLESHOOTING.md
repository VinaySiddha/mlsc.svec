# Troubleshooting Guide: Fixing Secret Access Errors

If your application fails to deploy or the login fails with an error message like:
`"Authentication and app configuration failed. The following secrets are missing or inaccessible to the server..."`

...it means your running application does not have permission to read the secrets it needs from Google Secret Manager. Even if you have set permissions on individual secrets, sometimes a project-level permission is required to resolve the issue.

Follow these steps to grant the necessary access.

---

### Step 1: Go to the IAM & Admin Page

1.  Open the Google Cloud Console for your project (`mlsc-30`).
2.  In the navigation menu (the "hamburger" icon ☰), go to **"IAM & Admin"**.

### Step 2: Grant Access

1.  At the top of the IAM & Admin page, click the **"+ GRANT ACCESS"** button.
2.  A new panel will open on the right side of the screen.

### Step 3: Add the Principal

1.  In the **"New principals"** text box, paste the exact service account name that appeared in your error message:
    ```
    firebase-app-hosting-compute@mlsc-30.iam.gserviceaccount.com
    ```

### Step 4: Assign the Role

1.  Click on the **"Select a role"** dropdown.
2.  In the filter box, type `Secret Manager Secret Accessor`.
3.  Select the **"Secret Manager Secret Accessor"** role from the list.

### Step 5: Save and Re-deploy

1.  Click the **"SAVE"** button.
2.  After saving, you must **trigger a new deployment** of your application. You can do this by pushing a small change (like adding a space to this file) to your GitHub repository.

This will give your application the necessary permissions to read all the secrets it needs, and the error will be resolved.
