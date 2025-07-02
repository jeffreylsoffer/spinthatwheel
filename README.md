# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

To run this project locally, you'll need to set up your environment variables.

1.  Create a file named `.env` in the root of the project.
2.  Add your Google Gemini API key to this file:

    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

### Deploying to Vercel

When you deploy to a platform like Vercel, you should not include your `.env` file in your repository. Instead, you'll need to configure the environment variables directly in your Vercel project dashboard.

1.  Go to your project's settings on Vercel.
2.  Navigate to the "Environment Variables" section.
3.  Add a new variable with the key `GEMINI_API_KEY` and paste your API key as the value.

This ensures that your key is kept secure and is not exposed in your codebase.
