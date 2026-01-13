import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // The client needs to know where the auth server is

  session: {
    additionalFields: {
      user: {
        role: {
          type: "string",
        },
      },
    },
  },
});

export const { useSession } = authClient;
