import type { Metadata } from "next";
import { JetBrains_Mono, Saira_Stencil_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/Header";
import {
  ButtonGroup,
  ButtonGroupSeparator
} from "@/components/ui/button-group"
import { Button } from "@/components/ui/button";
import { Notebook } from "lucide-react";
import Link from "next/link";
import { RiGeminiLine } from "react-icons/ri";
import { IoLogoGithub } from "react-icons/io";

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
      </body>
    </html>
  );
}
