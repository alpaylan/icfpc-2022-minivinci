
/* eslint-disable */

import { PngRef, RGBA } from './Color';
import { Canvas } from './Canvas';
import { Point } from './Point';
import { Block, SimpleBlock } from './Block';

export type Frame = RGBA[];

export class Painter {
    getPngPixel(canvas: Canvas, block: SimpleBlock, pixelCoordinate: Point): RGBA {
        let pngBottomLeft = (block.color as PngRef).bottomLeft;
        let pngTopLeft = new Point([pngBottomLeft.px, canvas.height - (block.size.py + pngBottomLeft.py)]);
        const blockTopLeft = new Point([block.bottomLeft.px, canvas.height - block.topRight.py]);
        const pointOffsetOnBlock = pixelCoordinate.subtract(blockTopLeft);
        const actualCoordinateOnPng = pngTopLeft.add(pointOffsetOnBlock);
        return canvas.sourcePng[actualCoordinateOnPng.py * canvas.width + actualCoordinateOnPng.px];
    }

    getPixel(canvas: Canvas, block: SimpleBlock, pixelCoordinate: Point): RGBA {
        if (block.color instanceof RGBA) {
            return block.color;
        } else {
            return this.getPngPixel(canvas, block, pixelCoordinate);
        }
    }

    draw(canvas: Canvas): Frame {
        const blocks = canvas.simplify();
        const frame: Frame = new Array(canvas.width * canvas.height);
        let size = 0;
        blocks.forEach(block => {
            const frameTopLeft = new Point([block.bottomLeft.px, canvas.height - block.topRight.py]);
            const frameBottomRight = new Point([block.topRight.px, canvas.height - block.bottomLeft.py]);

            size += (frameBottomRight.px - frameTopLeft.px)*(frameBottomRight.py - frameTopLeft.py);
            for(let y = frameTopLeft.py ; y < frameBottomRight.py ; y++) {
                    for(let x = frameTopLeft.px; x < frameBottomRight.px ; x++) {
                        frame[y * canvas.width + x] = this.getPixel(canvas, block, new Point([x, y]));

                }
            }
        });
        return frame;
    }
}
