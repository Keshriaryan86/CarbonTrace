import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BarChart, Bot, Box, Footprints, GitBranch, Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

const features = [
  {
    icon: <Footprints className="h-8 w-8 text-primary" />,
    title: 'Daily Activity Logging',
    description: 'Easily log daily activities like transport and food, with automatic CO₂ calculations.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI-Assisted Logging',
    description: 'Use natural language to describe activities. Our AI parses it into structured data for you.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Interactive Dashboard',
    description: 'Visualize your carbon footprint over time with beautiful, interactive charts and graphs.',
  },
  {
    icon: <GitBranch className="h-8 w-8 text-primary" />,
    title: 'Blockchain Commitment',
    description: 'Store a tamper-proof hash of your carbon data on the blockchain for ultimate transparency.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">CarbonTrace</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="absolute inset-0 h-full w-full object-cover object-center"
                data-ai-hint={heroImage.imageHint}
                priority
             />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-background/50"></div>
          
          <div className="container relative z-10 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Measure Your Impact. Prove It on the Blockchain.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                CarbonTrace is a blockchain-powered web application that allows you to log daily carbon-emitting activities, visualize your footprint, and immutably store verified records.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" asChild>
                  <Link href="/login">Start Tracking Today</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 sm:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A Transparent Approach to Sustainability
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Go beyond simple tracking. CarbonTrace provides the tools for accountability and verifiable proof of your environmental efforts.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col rounded-lg bg-card p-8 shadow-sm transition-all hover:shadow-md hover:shadow-primary/20">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        {feature.icon}
                    </div>
                    <h3 className="font-headline text-xl font-semibold leading-7 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex-auto text-base leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Leaf className="h-6 w-6 text-primary" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for a transparent future. © {new Date().getFullYear()} CarbonTrace.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
