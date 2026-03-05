import "./globals.css";
import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <header>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton>Sign in</SignInButton>
              <SignUpButton>Sign up</SignUpButton>
            </Show>
          </header>
          <Show when="signed-out">Hello</Show>
          <Show when="signed-in"> {children}</Show>
        </ClerkProvider>
      </body>
    </html>
  );
}
