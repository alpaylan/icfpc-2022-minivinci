import * as fs from 'fs/promises';
import axios from 'axios';
import {createCanvas} from 'canvas';

import { Interpreter } from "../Interpreter";
import { Painter } from "../Painter";
import { RGBA } from '../Color';

const filename = process.argv[2];
const problemId = process.argv[3];

const generate = async () => {
    try {
        const problemIdNumber = Number(problemId);

        let initialConfigResponse = null;

        try {
            initialConfigResponse = await axios.get(`https://cdn.robovinci.xyz/imageframes/${problemIdNumber}.initial.json`);
        } catch {}

        const fileContent = await fs.readFile(filename, 'utf8');

        const interpreter = new Interpreter();
        const interpretedStructure = initialConfigResponse ? interpreter.run_with_config(fileContent, initialConfigResponse.data, problemIdNumber) : interpreter.run(fileContent);

        const interpretedCanvas = interpretedStructure.canvas;

        const painter = new Painter();
        const renderedData = painter.draw(interpretedCanvas);

        const canvas = createCanvas(interpretedCanvas.width, interpretedCanvas.height);
        const context = canvas.getContext('2d');

        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        renderedData.forEach((pixel: RGBA, index: number) => {
            imgData.data[index * 4] = pixel.r;
            imgData.data[index * 4 + 1] = pixel.g;
            imgData.data[index * 4 + 2] = pixel.b;
            imgData.data[index * 4 + 3] = pixel.a;
        });
        context.putImageData(imgData, 0, 0);

        const outData = canvas.toDataURL('image/png');

        await fs.writeFile(`${filename}.png`, outData.slice('data:image/png;base64,'.length), { encoding: 'base64' });
    } catch (err) {
        console.error(err);
    }
};

Promise.resolve(true)
    .then(async () => {
        await generate();
    });
