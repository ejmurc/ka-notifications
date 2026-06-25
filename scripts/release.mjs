import { execSync } from 'child_process';

function colorMessage(message, color) {
  console.log(`${color}\x1b[1m${message}\x1b[0m`);
}

function runCommand(command, message) {
  try {
    colorMessage(`\n${message}...`, '\x1b[32m');
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    colorMessage(`${message} failed`, '\x1b[31m');
    process.exit(1);
  }
}

runCommand('npm run lint', 'Linting');
runCommand('npm run format', 'Formatting');
runCommand('npm run typecheck', 'Type checking');
runCommand('npm run prod', 'Building Chrome package');
runCommand('node scripts/zip-extension.mjs', 'Zipping package');
