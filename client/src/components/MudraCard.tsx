import type { MudraType } from "@/lib/mudras";
import { Card, CardContent } from "@/components/ui/card";
import { Hand, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface MudraCardProps {
  mudra: MudraType;
}

export default function MudraCard({ mudra }: MudraCardProps) {
  return (
    <Link href={`/mudra/${mudra.id}`}>
      <Card className="overflow-hidden border border-border/40 shadow-none hover:shadow-sm transition-all duration-300 cursor-pointer group bg-card" data-testid={`card-mudra-${mudra.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted/20 relative">
          {mudra.image ? (
            <img 
              src={mudra.image} 
              alt={mudra.name}
              className="w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Hand className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
          <span className="absolute top-3 right-3 bg-background/80 text-foreground/70 backdrop-blur-sm text-[9px] px-2 py-1 rounded uppercase tracking-[0.15em] font-medium">
            {mudra.category}
          </span>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors tracking-tight">
                {mudra.name}
              </h3>
              {mudra.sanskritName && (
                <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                  {mudra.sanskritName}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {mudra.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
