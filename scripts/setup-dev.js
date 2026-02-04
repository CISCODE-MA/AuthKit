/**
 * Setup script for Auth Kit development environment
 * Downloads required tools and sets up the environment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Auth Kit development environment...\n');

const toolsDir = path.join(__dirname, '..', 'tools');
const mailhogPath = path.join(toolsDir, process.platform === 'win32' ? 'mailhog.exe' : 'mailhog');

// Create tools directory
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
  console.log('✅ Created tools directory');
}

// Check if MailHog already exists
if (fs.existsSync(mailhogPath)) {
  console.log('✅ MailHog already installed');
  console.log('\n📧 To start MailHog:');
  if (process.platform === 'win32') {
    console.log('   PowerShell: .\\tools\\start-mailhog.ps1');
    console.log('   Or directly: .\\tools\\mailhog.exe');
  } else {
    console.log('   ./tools/mailhog');
  }
  console.log('\n🌐 Web UI will be at: http://localhost:8025');
  process.exit(0);
}

// Download MailHog
console.log('📥 Downloading MailHog...');

const mailhogUrl = process.platform === 'win32'
  ? 'https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_windows_amd64.exe'
  : process.platform === 'darwin'
  ? 'https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_darwin_amd64'
  : 'https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64';

const file = fs.createWriteStream(mailhogPath);

https.get(mailhogUrl, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Follow redirect
    https.get(response.headers.location, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        
        // Make executable on Unix
        if (process.platform !== 'win32') {
          fs.chmodSync(mailhogPath, '755');
        }
        
        console.log('✅ MailHog downloaded successfully\n');
        console.log('📧 To start MailHog:');
        if (process.platform === 'win32') {
          console.log('   PowerShell: .\\tools\\start-mailhog.ps1');
          console.log('   Or directly: .\\tools\\mailhog.exe');
        } else {
          console.log('   ./tools/mailhog');
        }
        console.log('\n🌐 Web UI will be at: http://localhost:8025');
        console.log('\n💡 Next steps:');
        console.log('   1. Start MailHog (in a separate terminal)');
        console.log('   2. npm run build');
        console.log('   3. npm run seed    (creates admin user)');
        console.log('   4. npm run start   (starts backend)');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      
      // Make executable on Unix
      if (process.platform !== 'win32') {
        fs.chmodSync(mailhogPath, '755');
      }
      
      console.log('✅ MailHog downloaded successfully\n');
      console.log('📧 To start MailHog:');
      if (process.platform === 'win32') {
        console.log('   PowerShell: .\\tools\\start-mailhog.ps1');
        console.log('   Or directly: .\\tools\\mailhog.exe');
      } else {
        console.log('   ./tools/mailhog');
      }
      console.log('\n🌐 Web UI will be at: http://localhost:8025');
      console.log('\n💡 Next steps:');
      console.log('   1. Start MailHog (in a separate terminal)');
      console.log('   2. npm run build');
      console.log('   3. npm run seed    (creates admin user)');
      console.log('   4. npm run start   (starts backend)');
    });
  }
}).on('error', (err) => {
  fs.unlinkSync(mailhogPath);
  console.error('❌ Download failed:', err.message);
  process.exit(1);
});
