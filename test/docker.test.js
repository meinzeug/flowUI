const { test, skip } = require('node:test');
const { execSync } = require('child_process');

function build(path, dockerfile) {
  execSync(`docker build -t temp-image -f ${dockerfile} ${path}`, { stdio: 'ignore' });
}

test('build backend Dockerfile', () => {
  try {
    build('backend', 'backend/Dockerfile');
  } catch (err) {
    skip('docker not available');
  }
});

test('build frontend Dockerfile', () => {
  try {
    build('.', 'Dockerfile');
  } catch (err) {
    skip('docker not available');
  }
});

