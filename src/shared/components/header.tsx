"use client";

import { Link } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { CONSTANTS } from "@/core/core.constants";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { CONSTANTS } from "@/core/core.constants";
import { Separator } from "@/components/ui/separator";

export const LogoLink = ({ theme = "light" }: { theme?: string }) => (
  <Link to={"/companies"} className="relative h-12 aspect-[3] w-full lg:w-fit">
    <img
      src={theme === "dark" ? CONSTANTS.LOGO_WHITE : CONSTANTS.LOGO}
      alt="Logo"
    />
  </Link>
);

export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-background top-0 left-0 w-full z-50 border-b border-primary/10">
      <div className="w-full px-2 h-fit py-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-primary dark:text-primary-foreground hover:bg-primary/10" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-primary/20"
            />
            <div className="hidden lg:flex items-center justify-center">
              {mounted && <LogoLink theme={theme} />}
            </div>
          </div>
          <div className="flex lg:hidden items-center justify-center">
            {mounted && <LogoLink theme={theme} />}
          </div>
          <ProfileHeader />
        </div>
      </div>
    </header>
  );
}
