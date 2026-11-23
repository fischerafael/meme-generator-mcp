import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ImgflipCredsSchema, type ImgflipCreds } from "../../../../shared/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (creds: ImgflipCreds) => void;
  pending: boolean;
  error?: string;
}

export function TokenForm({ onSubmit, pending, error }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<ImgflipCreds>({
    resolver: zodResolver(ImgflipCredsSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>1 · Generate your token</CardTitle>
        <CardDescription>
          Use your{" "}
          <a className="underline underline-offset-4" href="https://imgflip.com/signup" target="_blank" rel="noreferrer">
            Imgflip account
          </a>
          . We make one test call to Imgflip, then return an encrypted token. Nothing is stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imgflip username</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imgflip password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-10" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 text-muted-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full sm:w-fit">
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Checking with Imgflip…" : "Generate token"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
