const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = [
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    filename: 'marker-icon.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    filename: 'marker-icon-2x.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    filename: 'marker-shadow.png'
  }
];

const publicImagesDir = path.join(process.cwd(), 'public', 'images');

// Create the directory if it doesn't exist
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

icons.forEach(icon => {
  const file = fs.createWriteStream(path.join(publicImagesDir, icon.filename));
  https.get(icon.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${icon.filename}`);
    });
  }).on('error', err => {
    fs.unlink(path.join(publicImagesDir, icon.filename));
    console.error(`Error downloading ${icon.filename}:`, err.message);
  });
}); 