import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className={cn(
                "hover:text-foreground transition-colors",
                index === 0 && "flex items-center gap-1"
              )}
            >
              {index === 0 && <Home className="h-3 w-3" />}
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
