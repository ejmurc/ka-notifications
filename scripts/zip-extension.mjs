import { existsSync, mkdirSync, createWriteStream, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createExtensionZip() {
  // Read the version number from manifest.json
  const manifestPath = join(__dirname, '..', 'src', 'manifest.json');
  const manifestData = readFileSync(manifestPath, 'utf8');
  const version = JSON.parse(manifestData).version;

  // Create the zip files
  const outputDir = join(__dirname, '..', 'zip');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  const chromeZipName = `c-ka-notifications-${version}.zip`;

  // Create the chrome zip
  const chromeOutputPath = join(outputDir, chromeZipName);
  const chromeArchive = archiver('zip');
  const chromeZipStream = createWriteStream(chromeOutputPath);
  chromeZipStream.on('close', function () {
    console.log(`${chromeZipName} has been created successfully.`);
  });
  chromeArchive.pipe(chromeZipStream);
  chromeArchive.directory(join(__dirname, '..', 'chrome'), false);
  chromeArchive.finalize();
}

createExtensionZip();
