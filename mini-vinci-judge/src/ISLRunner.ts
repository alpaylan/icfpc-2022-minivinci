import * as fs from 'fs/promises';
import axios from 'axios';

import { Interpreter } from "./Interpreter";
import { Painter } from "./Painter";
import { SimilarityChecker } from "./SimilarityChecker";

const filename = process.argv[2];
const problemId = process.argv[3];

// Base URL serving the problem assets (imageframes/*). Defaults to the original
// bucket via its still-live path-style S3 URL; override with ASSETS_BASE_URL to
// point at your own R2/mirror.
const ASSETS_BASE_URL = (
    process.env.ASSETS_BASE_URL || 'https://s3.amazonaws.com/cdn.robovinci.xyz'
).replace(/\/+$/, '');

const islRunner = async () => {
    try {
        const problemIdNumber = Number(problemId);

        let initialConfigResponse = null;

        try {
            initialConfigResponse = await axios.get(`${ASSETS_BASE_URL}/imageframes/${problemIdNumber}.initial.json`);
        } catch {}

        try {
            if (initialConfigResponse && initialConfigResponse.data.sourcePngJSON) {
                initialConfigResponse.data.sourcePngData = (await axios.get(
                    initialConfigResponse.data.sourcePngJSON,
                )).data;
            }
        } catch {}

        const targetPaintingDataResponse = await axios.get(`${ASSETS_BASE_URL}/imageframes/${problemIdNumber}.json`);

        const fileContent = await fs.readFile(filename, 'utf8');

        const interpreter = new Interpreter();
        const interpretedStructure = initialConfigResponse ? interpreter.run_with_config(fileContent, initialConfigResponse.data, problemIdNumber) : interpreter.run(fileContent);

        const interpretedCanvas = interpretedStructure.canvas;
        const instructionCost = interpretedStructure.cost;

        const painter = new Painter();
        const renderedData = painter.draw(interpretedCanvas);

        const targetPainting = SimilarityChecker.dataToFrame(targetPaintingDataResponse.data);
        const similarityCost = SimilarityChecker.imageDiff(targetPainting, renderedData);

        const totalCost = instructionCost + similarityCost;
        return { "result": "success", "cost": totalCost };
    } catch (error) {
        return { "result": "error", "err": error.message};
    }
};


Promise.resolve(true)
    .then(async () => {
        console.log(
            JSON.stringify(await islRunner())
        );
    })
