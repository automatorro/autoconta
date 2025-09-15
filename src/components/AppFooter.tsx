import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn(
      "h-14 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "flex items-center justify-between px-4 py-2",
      className
    )}>
      {/* Left side - Copyright */}
      <div className="text-sm text-muted-foreground">
        &copy; {currentYear} AutoConta. Toate drepturile rezervate.
      </div>
      
      {/* Right side - Links */}
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com/lucianm05/AUTOCONTA" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4 inline-block mr-1" />
          GitHub
        </a>
        <a 
          href="#" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Termeni și condiții
        </a>
        <a 
          href="#" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Politica de confidențialitate
        </a>
      </div>
    </footer>
  );
}