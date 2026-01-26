import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between items-center px-4 py-3 bg-background/95 border-t border-border">
      <Link href="/">
        <h1 className="font-display text-2xl font-bold text-gradient">
          Arbiterix
        </h1>
      </Link>

      <span className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Arbiterix. All rights reserved.
      </span>

      <div className="flex items-center gap-4 ">
        <Button asChild className="rounded-full">
          <Link href="https://github.com/Ashwin-Pulipati/arbiterix">
            <Github className="mr-2 h-4 w-4" /> Github
          </Link>
        </Button>

        <Button asChild className="rounded-full">
          <Link href="https://www.linkedin.com/in/ashwinpulipati/">
            <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
          </Link>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
