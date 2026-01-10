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
import { Notebook } from "lucide-react";
import Link from "next/link";
import { RiGeminiLine } from "react-icons/ri";
import { IoLogoGithub } from "react-icons/io";
import { ReactLenis } from '@/utils/lenis'

import {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignUpButton,
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
    <ReactLenis root>
      <ClerkProvider
        appearance={{
          theme: dark,
        }}
      >
        <html
          lang="en"
          className={`${Logo.variable} ${JetBrainsMono.className}`}
          data-scroll-locked
          suppressHydrationWarning
        >
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              {children}
              <ButtonGroup className="fixed bottom-2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xl scale-105 flex gap-1">
                {/* <Link href='/notes'> */}
                {/*   <Button variant='outline'> */}
                {/*     <Notebook></Notebook> */}
                {/*     Notes */}
                {/*   </Button> */}
                {/* </Link> */}
                <Link href='/ai'>
                  <Button variant='outline'>
                    <RiGeminiLine />
                    Ask AI
                  </Button>
                </Link>

              </ButtonGroup>
              <Toaster position="top-right" />
            </ThemeProvider>
            <div className="flex justify-center items-center w-full mt-20">
              <SignedOut>
                <SignIn />
                {/* <SignUpButton> */}
                {/*   <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"> */}
                {/*     Sign Up */}
                {/*   </button> */}
                {/* </SignUpButton> */}
              </SignedOut>
              <SignedIn>
              </SignedIn>
            </div>
          </body>
        </html>
      </ClerkProvider>
    </ReactLenis>
  );
}
