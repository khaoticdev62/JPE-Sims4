import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

/**
 * TS4Rebels API Route
 * 
 * Bridges the Python CLI for ts4rebels.cc scraping and topic extraction.
 * Supports:
 * - GET /api/ts4rebels?forum=<id>  (List forum topics)
 * - GET /api/ts4rebels?topic=<id>  (Fetch topic links)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forumId = searchParams.get('forum');
  const topicId = searchParams.get('topic');
  const page = searchParams.get('page') || '1';
  const cookies = request.headers.get('x-ts4rebels-cookies');

  const startTime = Date.now();

  try {
    const args: string[] = ['cli.py', 'ts4rebels', '--enable-network'];

    if (cookies) {
      // Expecting base64 encoded JSON string to avoid shell escaping issues
      try {
        const decodedCookies = Buffer.from(cookies, 'base64').toString('utf-8');
        args.push('--cookies', decodedCookies);
      } catch (_e) {
        console.warn('[TS4Rebels Bridge] Failed to decode cookies header');
      }
    }

    if (forumId) {
      if (!/^\d+$/.test(forumId)) throw new Error('Invalid Forum ID');
      args.push('forum', forumId, '--page', page);
    } else if (topicId) {
      if (!/^\d+$/.test(topicId)) throw new Error('Invalid Topic ID');
      args.push('topic', topicId, '--page', page);
    } else {
      return NextResponse.json({ success: false, error: 'forum or topic parameter is required' }, { status: 400 });
    }

    const result = await runPythonCommand(args);
    const duration = Date.now() - startTime;

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(result.stdout),
        performance: { duration }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.stderr || 'Command failed',
        performance: { duration }
      }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

/**
 * Authentication & Action Proxy
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
      }

      const args = ['cli.py', 'ts4rebels', '--enable-network', 'login', '--username', username, '--password', password];
      const result = await runPythonCommand(args);
      const duration = Date.now() - startTime;

      if (result.success) {
        const payload = JSON.parse(result.stdout);
        return NextResponse.json({
          success: payload.ok,
          data: payload,
          performance: { duration }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.stderr || 'Authentication failed',
          performance: { duration }
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * Executes a Python command and returns the output.
 */
async function runPythonCommand(args: string[]): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    // Try 'python' then 'python3'
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const cliPath = path.join(process.cwd(), args[0]);
    const finalArgs = [cliPath, ...args.slice(1)];

    console.log(`[TS4Rebels Bridge] Executing: ${pythonCmd} ${finalArgs.join(' ')}`);

    const child = spawn(pythonCmd, finalArgs, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr
      });
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        stdout: '',
        stderr: err.message
      });
    });
  });
}
