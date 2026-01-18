import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { useMedia } from 'react-use';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserSelector } from './user-selector';

const Header = () => {
     const isMdUp = useMedia("(min-width: 768px)", false);
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 md:px-4 lg:h-15 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex aspect-square w-15 h-12 items-center justify-center text-primary-foreground">
            <Image
              src="/logo.png"
              alt="Arbiter Logo"
              className="h-full w-full p-0.5"
              width={64}
              height={64}
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold font-display text-gradient text-xl">
              Arbiter
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Agentic Workspace
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {isMdUp ? <UserSelector /> : <SidebarTrigger />}
      </div>
    </header>
  );
}

export default Header