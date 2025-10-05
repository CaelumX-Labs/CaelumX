module.exports = {
  apps: [{
    name: 'caelumx-api',
    script: 'dist/server.js',
    cwd: '/home/ubuntu/CaelumX/app/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/ubuntu/CaelumX/app/backend/logs/pm2-error.log',
    out_file: '/home/ubuntu/CaelumX/app/backend/logs/pm2-out.log',
    log_file: '/home/ubuntu/CaelumX/app/backend/logs/pm2-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
