/* eslint-disable */

import { Block, SimpleBlock } from './Block';
import { Color, PngRef, RGBA } from './Color';
import { Point } from './Point';

export type SerializedPoint = [number, number];
export type SerializedRGBA = [number, number, number, number];

export type SerializedBlock = {
    blockId: string,
    bottomLeft: SerializedPoint,
    topRight: SerializedPoint,
    color: SerializedRGBA,
    pngBottomLeftPoint: SerializedPoint
};

export type InitialConfig = {
    width: number,
    height: number,
    sourcePngJSON: string,
    sourcePngData: RGBA[],
    blocks: SerializedBlock[],
};

export class Canvas {
    width: number;

    height: number;

    backgroundColor: Color;

    blocks: Map<string, Block>;

    sourcePng: RGBA[];

    constructor(width: number, height: number, backgroundColor: RGBA) {
        this.width = width;
        this.height = height;

        this.backgroundColor = backgroundColor;
        this.blocks = new Map();
        this.sourcePng = [];
        this.blocks.set(
            "0",
            new SimpleBlock(
                "0",
                new Point([0, 0]),
                new Point([width, height]),
                backgroundColor,
            )
        );
    }

    static fromInitialConfiguration(initialConfig: InitialConfig): Canvas {
        let canvas = new Canvas(
            initialConfig.width,
            initialConfig.height,
            new RGBA([255, 255, 255, 255])
        );
        if (initialConfig.sourcePngData) {
            canvas.sourcePng = initialConfig.sourcePngData.map(a => new RGBA(a as any));
        }
        canvas.blocks.clear();
        initialConfig.blocks.forEach(serializedBlock => {
            if (serializedBlock.color) {
                canvas.blocks.set(
                    serializedBlock.blockId,
                    new SimpleBlock(
                        serializedBlock.blockId,
                        new Point(serializedBlock.bottomLeft),
                        new Point(serializedBlock.topRight),
                        new RGBA(serializedBlock.color as SerializedRGBA)
                    )
                )
            } else {
                canvas.blocks.set(
                    serializedBlock.blockId,
                    new SimpleBlock(
                        serializedBlock.blockId,
                        new Point(serializedBlock.bottomLeft),
                        new Point(serializedBlock.topRight),
                        new PngRef(serializedBlock.pngBottomLeftPoint as SerializedPoint)
                    )
                )
            }


        })
        return canvas;
    }

    get size(): Point {
        return new Point([this.width, this.height]);
    }

    simplify(): SimpleBlock[] {
        let simplifiedBlocks: SimpleBlock[] = [];
        this.blocks.forEach(value => {
            simplifiedBlocks = simplifiedBlocks.concat(value.getChildren());
        });
        return simplifiedBlocks;
    }


}
