import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Button asChild variant="outline">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
