import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { app } from './index.js';
import { env } from './shared/env.js';

// Static asset serving in both modes:
// - default: the SPA is served with Vite's original /assets/... URLs (xCloud,
//   standard Nginx reverse proxies)
// - PANEL_ASSET_REWRITE=true: guards against hosting panels whose nginx
//   intercepts *.css / *.js URLs before they reach Node — the SPA must be
//   loadable entirely through the extensionless /static/... asset routes.
describe('static asset serving (default mode)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(() => {
    process.env.PANEL_ASSET_REWRITE = 'false';
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    // Undici keep-alive sockets can hold server.close() open past the hook
    // timeout, so force them shut first.
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  function assetName(extension: string): string {
    const dir = path.join(env.CLIENT_DIST, 'assets');
    const file = fs.readdirSync(dir).find((f) => f.endsWith(`.${extension}`));
    if (!file) throw new Error(`no .${extension} asset found in ${dir}`);
    return file.slice(0, -(extension.length + 1));
  }

  it('serves the SPA index with original Vite asset URLs', async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/\/assets\/[\w.-]+\.css/);
    expect(html).toMatch(/\/assets\/[\w.-]+\.js/);
    expect(html).not.toMatch(/\/static\/css\/[\w.-]+/);
  });

  it('serves built css directly from the assets directory', async () => {
    const res = await fetch(`${baseUrl}/assets/${assetName('css')}.css`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/css');
  });

  it('serves built js directly from the assets directory', async () => {
    const res = await fetch(`${baseUrl}/assets/${assetName('js')}.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('javascript');
  });

  it('still serves assets through the extensionless routes', async () => {
    const res = await fetch(`${baseUrl}/static/css/${assetName('css')}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/css');
  });
});

describe('static asset serving (PANEL_ASSET_REWRITE=true)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(() => {
    process.env.PANEL_ASSET_REWRITE = 'true';
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  function assetName(extension: string): string {
    const dir = path.join(env.CLIENT_DIST, 'assets');
    const file = fs.readdirSync(dir).find((f) => f.endsWith(`.${extension}`));
    if (!file) throw new Error(`no .${extension} asset found in ${dir}`);
    return file.slice(0, -(extension.length + 1));
  }

  it('serves the SPA index with extensionless asset URLs', async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).not.toMatch(/\/assets\/[\w.-]+\.css/);
    expect(html).not.toMatch(/\/assets\/[\w.-]+\.js/);
    expect(html).toMatch(/\/static\/css\/[\w.-]+/);
    expect(html).toMatch(/\/static\/js\/[\w.-]+/);
  });

  it('serves built css through the extensionless route', async () => {
    const res = await fetch(`${baseUrl}/static/css/${assetName('css')}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/css');
  });

  it('serves built js through the extensionless route', async () => {
    const res = await fetch(`${baseUrl}/static/js/${assetName('js')}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('javascript');
  });

  it('returns 404 for traversal attempts and unknown assets', async () => {
    const traversal = await fetch(`${baseUrl}/static/css/..%2F..%2Fenv`);
    expect(traversal.status).toBe(404);
    const unknown = await fetch(`${baseUrl}/static/js/does-not-exist`);
    expect(unknown.status).toBe(404);
  });
});
