module.exports = {
  apps: [
    {
      name: 'elitequest',
      script: './server/dist/index.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      logFile: './logs/combined.log',
      outFile: './logs/out.log',
      errorFile: './logs/error.log',
      logDateFormat: 'YYYY-MM-DD HH:mm:ss Z',
      mergeLogs: true,
    },
  ],
};
