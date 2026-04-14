const args = process.argv.slice(2);
const logPath = process.env.FAKE_CLAUDE_LOG;

if (logPath) {
  const record = {
    args,
    env: {
      CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN ?? null,
      CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR ?? null,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? null,
      ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN ?? null,
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB:
        process.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB ?? null,
    },
  };

  await Bun.write(logPath, JSON.stringify(record, null, 2));
}

if (args[0] === "setup-token") {
  console.log("<token>");
  console.log("Store this token securely. You won't be able to see it again.");
  console.log("Use this token by setting: export CLAUDE_CODE_OAUTH_TOKEN=<token>");
  process.exit(0);
}

if (args.includes("-p") && args.includes("--output-format") && args.includes("json")) {
  console.log(JSON.stringify({ session_id: "fake-session-id" }));
  process.exit(0);
}

process.exit(0);
