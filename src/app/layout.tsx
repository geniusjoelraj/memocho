import type { Metadata } from "next";
import { JetBrains_Mono, Saira_Stencil_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/Header";
import {
  ButtonGroup,
} from "@/components/ui/button-group"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiGeminiLine } from "react-icons/ri";
import { ReactLenis } from '@/utils/lenis'

import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'

const JetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const Logo = Saira_Stencil_One({
  weight: "400",
  variable: '--font-logo',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Memocho",
  description: "An AI powered note taking app",
};

import { dark } from '@clerk/themes'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html
        lang="en"
        className={`${Logo.variable} ${JetBrainsMono.className}`}
        suppressHydrationWarning
      >
        <body>
          <ReactLenis root>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <SignedIn>
                {children}
                <ButtonGroup className="fixed bottom-2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xl scale-105 flex gap-1">
                  <Link href='/ai'>
                    <Button variant='outline'>
                      <RiGeminiLine />
                      Ask AI
                    </Button>
                  </Link>
                </ButtonGroup>
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col justify-center items-center w-full mt-20 gap-6">
                  <SignIn />
                  <div className="text-center text-sm text-muted-foreground border border-border rounded-lg px-6 py-4 max-w-xs">
                    <p className="font-semibold text-foreground mb-1">Demo Credentials</p>
                    <p>Username: <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">demo</code></p>
                    <p>Password: <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">12345678</code></p>
                  </div>
                </div>
              </SignedOut>
              <Toaster position="top-right" />
            </ThemeProvider>
          </ReactLenis>
        </body>
      </html>
    </ClerkProvider>
  );
}
