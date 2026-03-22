import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Home, Users, Settings, UserPlus, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "સમાજ માહિતી", icon: Home },
    { href: "/directory", label: "ઘર ડિરેક્ટ્રી", icon: Users },
  ];

  if (user?.role === "home_admin") {
    navLinks.push({ href: "/home", label: "નવું ઘર ઉમેરો", icon: UserPlus });
  }

  if (user?.role === "super_admin") {
    navLinks.push({ href: "/admin", label: "એડમિન પેનલ", icon: Settings });
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Decoration */}
      <div className="h-2 w-full saffron-gradient absolute top-0 left-0 z-50"></div>
      
      <header className="sticky top-0 z-40 w-full glass-panel border-b-0 rounded-none shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary border border-orange-200">
                <Users className="w-6 h-6" />
              </div>
              <Link href="/" className="font-display font-bold text-2xl text-secondary hover:text-primary transition-colors">
                સમાજ ડિરેક્ટ્રી
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300",
                      isActive 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-foreground hover:bg-orange-100/50 hover:text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="w-px h-8 bg-border mx-2"></div>

              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  લૉગ આઉટ
                </button>
              ) : (
                <Link
                  href="/login"
                  className="saffron-gradient px-6 py-2.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  લૉગિન
                </Link>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-secondary hover:bg-orange-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t bg-white/95 backdrop-blur overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => {
                  const isActive = location === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                        isActive 
                          ? "bg-primary text-white" 
                          : "text-foreground hover:bg-orange-50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
                {user ? (
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    લૉગ આઉટ
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mt-2 saffron-gradient px-4 py-3 rounded-xl font-bold"
                  >
                    લૉગિન
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      <footer className="mt-auto py-8 text-center text-muted-foreground font-medium border-t border-border/50 bg-white/50 backdrop-blur">
        <p>શ્રી સમાજ પરિવાર ડિરેક્ટ્રી © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
