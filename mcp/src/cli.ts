import { spawn } from 'child_process';

function runCli(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude-flow', args);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => out += d.toString());
    proc.on('close', code => {
      if (code === 0) resolve(out);
      else reject(new Error(`exit ${code}`));
    });
  });
}

export function runBatch(options: string[]): Promise<string> {
  return runCli(['batch', ...options]);
}

export function runFlow(flow: string): Promise<string> {
  return runCli(['run', flow]);
}
