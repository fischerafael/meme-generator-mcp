import { Separator } from "@/components/ui/separator";
import { Hero } from "../components/Hero";
import { Steps } from "../components/Steps";
import { Features } from "../components/Features";

export function LandingPage() {
  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <Separator />
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Three steps</h2>
        <Steps />
      </section>
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Why it works well</h2>
        <Features />
      </section>
    </div>
  );
}
