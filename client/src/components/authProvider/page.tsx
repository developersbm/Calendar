"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import "@aws-amplify/ui-react/styles.css";
import { signOut } from "aws-amplify/auth";

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

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out");

    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };  
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
        return <div>
          <p>Sign Out if needed</p>
          <button
        onClick={handleSignOut}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Sign Out
          </button>
          </div>;
      }}
    </Authenticator>
  );
};


export default AuthProvider;
