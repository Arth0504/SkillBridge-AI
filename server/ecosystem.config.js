module.exports = {
  apps: [
    {
      name: 'skillbridge-backend',
      script: './server.js',
      instances: 'max', // Run in cluster mode utilizing all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      error_file: './logs/pm2_error.log',
      out_file: './logs/pm2_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
