
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  LayoutDashboard,
  Wallet as WalletIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container relative overflow-x-hidden">
      <section className="relative mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl md:-top-40 md:h-[600px] md:w-[600px] animate-background-glow"
        />
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Welcome to BlitzPay - Future of Digital Payments
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Fast, secure, and seamless transactions with BlitzPay.
        </p>
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button size="lg" asChild>
            <Link to="/auth" state={{ isSignUp: true }}>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/markets">View Markets</Link>
          </Button>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
            Features
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Everything you need for seamless crypto payments and tracking.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Market Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stay updated with real-time cryptocurrency prices, market caps,
                and trends. Our comprehensive dashboard gives you a bird's-eye
                view of the market.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <WalletIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Personal Wallet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Securely manage your digital assets. Deposit and withdraw funds
                with ease, and keep track of all your transactions in one
                place.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
