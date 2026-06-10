const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;

const BASE_PATH = process.cwd();

let imageNames = fs.readdirSync(path.join(BASE_PATH, 'images'));

for (const imageName of imageNames) {
    if (!imageName.endsWith('.png')) continue;

    let data = fs.readFileSync(path.join(BASE_PATH, 'images', imageName));
    let png = PNG.sync.read(data);

    let frame = [];

    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            let idx = (png.width * y + x) << 2;

            frame.push(png.data.slice(idx, idx + 4).toJSON().data);
        }
    }

    console.log(path.basename(imageName));
    fs.writeFileSync(path.join(BASE_PATH, 'images', path.basename(imageName, path.extname(imageName)) + ".json"), JSON.stringify(frame), { encoding: "utf8" });
}
