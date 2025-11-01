import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const navLinks = [
  { title: 'Markets', href: '/markets' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged out successfully" });
      navigate('/auth');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">BlitzPay</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              to={link.href}
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <Button asChild variant="link" className="p-0 h-auto font-medium">
                <Link to="/wallet">Wallet</Link>
              </Button>
              <span className="text-sm text-muted-foreground">{session.user.email}</span>
              <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth" state={{ isSignUp: true }}>Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/40 p-4 animate-accordion-down">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className="text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-4">
              {session ? (
                <>
                  <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/wallet">Wallet</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Log In</Link>
                  </Button>
                  <Button asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth" state={{ isSignUp: true }}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
