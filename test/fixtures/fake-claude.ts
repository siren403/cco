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
      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL ?? null,
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? null,
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
  const errorStatus = Number(
    /^fake-api-error-(\d+)$/.exec(process.env.CLAUDE_CODE_OAUTH_TOKEN ?? "")?.[1],
  );
  if (Number.isInteger(errorStatus)) {
    console.log(
      JSON.stringify({
        api_error_status: errorStatus,
        result: errorStatus === 429 ? "You've hit your limit · resets 9pm (Asia/Seoul)" : "API error",
      }),
    );
    process.exit(1);
  }

  console.log(JSON.stringify({ session_id: "fake-session-id" }));
  process.exit(0);
}

process.exit(0);
