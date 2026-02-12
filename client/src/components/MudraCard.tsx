import { Mudra } from "@/lib/mudras";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface MudraCardProps {
  mudra: Mudra;
}

export default function MudraCard({ mudra }: MudraCardProps) {
  return (
    <Link href={`/mudra/${mudra.id}`}>
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group bg-card">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30 relative">
          <img 
            src={mudra.image} 
            alt={mudra.name}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <Badge className="absolute top-3 right-3 bg-white/80 text-foreground backdrop-blur-sm hover:bg-white border-none font-normal text-xs uppercase tracking-wider">
            {mudra.category}
          </Badge>
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
                {mudra.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1 italic">
                {mudra.sanskritName}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {mudra.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
