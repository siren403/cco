import type { ReactNode } from "react";
import { render } from "ink";

export interface InkHostOptions {
  readonly stdin: NodeJS.ReadStream;
  readonly stdout: NodeJS.WriteStream;
  readonly stderr: NodeJS.WriteStream;
}

export async function renderInkHost(
  node: ReactNode,
  options: InkHostOptions,
): Promise<void> {
  const app = render(node, {
    stdin: options.stdin,
    stdout: options.stdout,
    stderr: options.stderr,
    exitOnCtrlC: options.stdin.isTTY && options.stdout.isTTY,
  });

  await app.waitUntilRenderFlush();
  app.unmount();
  await app.waitUntilExit();
}
