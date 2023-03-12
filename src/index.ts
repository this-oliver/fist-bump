import { exec } from 'child_process';
import path from 'path';

// get path to '../scripts' folder
const scriptsPath = path.join(__dirname, '../scripts');

// execute script
exec(`${scriptsPath}/bump.sh`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});