"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

const formFields = {
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      inputProps: { required: true },
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", required: true },
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      inputProps: { type: "password", required: true },
    },
  },
};

interface AuthUser {
  username: string;
  email?: string;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const stableRouter = useMemo(() => router, [router]);

  useEffect(() => {
    const listener = Hub.listen("auth", (data) => {
      if (data?.payload?.event === "signedIn") {
        stableRouter.push("/");
      }
    });

    return () => {
      listener();
    };
  }, [stableRouter]);
  
  interface AuthUser {
    username: string;
    email?: string;
  }
  return (
    <Authenticator formFields={formFields}>
      {( {user}: { user?: AuthUser | null }) => {
        if (user) {
          return (
            <div>
              {children}
            </div>
          );
        }
        return <p>Redirecting to login...</p>;
      }}
    </Authenticator>
  );
};


export default AuthProvider;
