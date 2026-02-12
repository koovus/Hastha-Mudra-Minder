import { useState } from "react";
import { Link } from "wouter";
import { mudras } from "@/lib/mudras";
import Layout from "@/components/Layout";
import MudraCard from "@/components/MudraCard";
import { Sparkles } from "lucide-react";

export default function Home() {
  const featuredMudra = mudras[0];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        
        {/* Welcome Header */}
        <div className="pt-4 pb-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl font-serif text-foreground leading-tight">
            Find stillness in <br/>
            <span className="text-primary italic">the present moment.</span>
          </h2>
        </div>

        {/* Featured Card */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif">Daily Practice</h3>
            <span className="text-xs text-secondary font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recommended
            </span>
          </div>
          <MudraCard mudra={featuredMudra} />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/breathe">
            <a className="bg-primary/5 hover:bg-primary/10 transition-colors p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.5 9.4c1.1 1.1 3 1.1 4.2 0 1.2-1.2 1.2-3.1 0-4.2C12.5 4 10.6 4 9.5 5.2c-1.1 1.1-1.1 3-1.1 3s1.9 0 3 .1c1.2.1 3.1 0 4.2-1.1" />
                  <path d="M14.5 14.6c-1.1-1.1-3-1.1-4.2 0-1.2 1.2-1.2 3.1 0 4.2 1.2 1.2 3.1 1.2 4.2 0 1.1-1.1 1.1-3 1.1-3s-1.9 0-3-.1c-1.2-.1-3.1 0-4.2 1.1" />
                </svg>
              </div>
              <div>
                <span className="block font-medium text-foreground">Breathe</span>
                <span className="text-xs text-muted-foreground">3 min session</span>
              </div>
            </a>
          </Link>
          
          <Link href="/journal">
            <a className="bg-secondary/5 hover:bg-secondary/10 transition-colors p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-secondary/10">
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <span className="block font-medium text-foreground">Reflect</span>
                <span className="text-xs text-muted-foreground">Log entry</span>
              </div>
            </a>
          </Link>
        </section>

        {/* Quote */}
        <div className="bg-muted/30 p-6 rounded-xl border border-border/50 text-center">
          <p className="font-serif italic text-lg text-foreground/80 leading-relaxed">
            "Quiet the mind, and the soul will speak."
          </p>
          <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-medium">— Ma Jaya Sati Bhagavati</p>
        </div>
      </div>
    </Layout>
  );
}
