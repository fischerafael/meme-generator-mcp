const steps = [
  { title: "Generate a token", body: "Enter your Imgflip username and password. We check them once and seal them into an encrypted token." },
  { title: "Add the connector", body: "In Claude, add a custom connector with our MCP URL and paste the token as the Bearer token." },
  { title: "Ask for a meme", body: "“Make a Scooby-Doo reveal meme about flaky tests.” Claude picks the template and fills each box." },
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
