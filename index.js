// Entry point for panel deployments (xCloud Node.js start command: npm start,
// which runs `node index.js`). Compiled output is committed to git so the app
// boots even on panels without a build step; on xCloud the panel-side build
// command (`npm run build`) rebuilds it before start.
process.env.PORT ??= '3000'; // xCloud injects PORT itself; this is only a fallback
import('./server/dist/index.js');
