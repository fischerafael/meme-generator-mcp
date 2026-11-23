import { Separator } from "@/components/ui/separator";
import { Hero } from "../components/Hero";
import { Steps } from "../components/Steps";

export function LandingPage() {
  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <Separator />
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <Steps />
      </section>
    </div>
  );
}
