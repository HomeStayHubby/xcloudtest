import express from 'express';
import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { env } from './shared/env.js';
import { runMigrations } from './db/migrate.js';
import { errorHandler } from './shared/error-handler.js';
import { authRoutes } from './features/auth/auth.routes.js';
import { userRoutes } from './features/users/user.routes.js';
import { classRoutes } from './features/classes/class.routes.js';
import { studentRoutes } from './features/students/student.routes.js';
import { quizRoutes } from './features/quizzes/quiz.routes.js';
import { questionRoutes } from './features/questions/question.routes.js';
import { questionBankRoutes } from './features/question-banks/question-bank.routes.js';
import { responseRoutes } from './features/responses/response.routes.js';
import { liveRoutes } from './features/live/live.routes.js';
import { registerLiveSocketHandlers } from './features/live/live.socket.js';
import { groupRoutes } from './features/groups/group.routes.js';
import { playRoutes } from './features/play/play.routes.js';
import { campaignRoutes } from './features/campaigns/campaign.routes.js';
import { resultsRoutes } from './features/results/results.routes.js';
import { pacingRoutes } from './features/live/pacing.routes.js';
import { gameRoutes } from './features/games/game.routes.js';
import { settingsRoutes } from './features/settings/settings.routes.js';
import { aiGenerationRoutes } from './features/ai-generation/ai-generation.routes.js';
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
    },
});
if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
const sessionsDir = path.resolve(env.DATA_DIR, 'sessions');
fs.mkdirSync(sessionsDir, { recursive: true });
const SQLiteStore = SQLiteStoreFactory(session);
const sessionStore = new SQLiteStore({ db: 'sessions.db', dir: sessionsDir });
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(session({
    store: sessionStore,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/play', playRoutes);
app.use('/api/v1', pacingRoutes);
app.use('/api/v1', responseRoutes);
// Lecturer/admin routers (all endpoints enforce role + ownership inside).
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1', studentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1', questionRoutes);
app.use('/api/v1', questionBankRoutes);
app.use('/api/v1', liveRoutes);
app.use('/api/v1', groupRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1', resultsRoutes);
app.use('/api/v1', gameRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/ai', aiGenerationRoutes);
const staticDir = env.CLIENT_DIST;
// Some hosting panels' nginx intercepts *.css and *.js URLs before they reach
// Express, so Vite's /assets/*.* files would 404 and the SPA renders blank.
// Only such panels need the rewrite — enable it with PANEL_ASSET_REWRITE=true.
// xCloud and standard Nginx reverse proxies pass asset URLs through fine, so
// the default (off) serves the original index.html with Vite asset URLs. The
// /static/css/<name> and /static/js/<name> routes stay registered in both
// modes so enabling the flag requires no code change.
const ASSET_NAME = /^[\w.-]+$/;
const indexHtmlPath = path.join(staticDir, 'index.html');
let rawIndexHtml = null;
let panelSafeIndex = null;
function getIndexHtml() {
    if (process.env.PANEL_ASSET_REWRITE === 'true') {
        if (panelSafeIndex === null) {
            panelSafeIndex = getRawIndexHtml()
                .replace(/\/assets\/([\w.-]+)\.css/g, '/static/css/$1')
                .replace(/\/assets\/([\w.-]+)\.js/g, '/static/js/$1');
        }
        return panelSafeIndex;
    }
    return getRawIndexHtml();
}
function getRawIndexHtml() {
    if (rawIndexHtml === null) {
        rawIndexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    }
    return rawIndexHtml;
}
function sendIndexHtml(_req, res) {
    try {
        res.type('html').send(getIndexHtml());
    }
    catch {
        res.sendFile(indexHtmlPath);
    }
}
function serveStaticAsset(extension) {
    return (req, res) => {
        const name = path.basename(req.params.name ?? '');
        const file = path.join(staticDir, 'assets', `${name}.${extension}`);
        if (!ASSET_NAME.test(name) || !fs.existsSync(file)) {
            res.sendStatus(404);
            return;
        }
        res.sendFile(file);
    };
}
app.get('/index.html', sendIndexHtml);
app.use(express.static(staticDir, { index: false }));
app.get('/static/css/:name', serveStaticAsset('css'));
app.get('/static/js/:name', serveStaticAsset('js'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('*', sendIndexHtml);
app.use(errorHandler);
registerLiveSocketHandlers(io, sessionStore);
async function main() {
    await runMigrations();
    server.listen(env.PORT, () => {
        console.log(`ELITEQuest server running on http://localhost:${env.PORT}`);
    });
}
if (env.NODE_ENV !== 'test') {
    main().catch((err) => {
        console.error('Server failed to start:', err);
        process.exit(1);
    });
}
export { app, io };
//# sourceMappingURL=index.js.map