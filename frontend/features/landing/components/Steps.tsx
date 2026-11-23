const steps = [
  { title: "Generate a token", body: "Enter your free Imgflip login. We check it once and seal it into an encrypted token. Nothing is stored." },
  { title: "Connect your assistant", body: "Add our MCP server URL as a custom connector and paste the token as the Bearer token." },
  { title: "Ask for a meme", body: "“Make a Scooby-Doo reveal meme about flaky tests.” The assistant picks the template and fills each box." },
];

export function Steps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-xl border p-5">
          <div className="mb-3 flex size-7 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {i + 1}
          </div>
          <h3 className="font-medium">{s.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
