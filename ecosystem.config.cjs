module.exports = {
  apps: [{
    name: 'danang-vip',
    script: 'node_modules/.bin/next',
    args: 'start -p 3010',
    cwd: '/projects/danang-vip',
    kill_timeout: 5000,
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
};
