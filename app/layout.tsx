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
      <body className="bg-gray-50 antialiased">
        <ClerkProvider>
          <header>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <div className="flex justify-end gap-2 bg-gray-300 p-2">
                <SignInButton>
                  <button className="text-sm font-medium border border-amber-50 text-mist-500  px-4 py-1.5 rounded-md hover:bg-gray-800">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="text-sm font-medium border border-amber-50 text-mist-500 px-4 py-1.5 rounded-md hover:bg-gray-800">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </header>
          <Show when="signed-in"> {children}</Show>
        </ClerkProvider>
      </body>
    </html>
  );
}
