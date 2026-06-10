/* eslint-disable */

import { BlockType } from '../Block';
import { Canvas } from '../Canvas';
import { RGBA } from '../Color';
import { Interpreter } from '../Interpreter';
import { Point } from '../Point';
import { RandomInstructionGenerator } from '../RandomInstructionGenerator';

const _ = require('lodash');


export class ContestLogicTester {

    runTester(size: number) {
        let canvas = new Canvas(400, 400, new RGBA([255, 0, 0, 0]));
        let interpreter = new Interpreter();
        let instructions = []
        for(let move = 0; move < size  ; move++) {
            const instruction = RandomInstructionGenerator.generateRandomInstruction(canvas);
            console.log(instruction.typ);
            instructions.push(instruction);
            const interpreterResult = interpreter.interpret(move, canvas, instruction, 0);
            canvas = (interpreterResult.canvas as Canvas);
            this.checkCanvasInvariants(canvas);
        }
        return canvas;
    }
    
    checkCanvasInvariants(state: Canvas) {
        /**
         * 1. Blocks should be disjoint.
         * 2. Each block must be inside the canvas
         * 3. Check if block sizes add to the total cover.
         * 4. Each ComplexBlock must have (1) and (2) for its inner blocks.
         */
        if (!this.checkBlockDisjoint(state)) {
            throw Error('Blocks are not disjoint');
        }
        if (!this.checkBlockInside(state)) {
            throw Error('Blocks are not inside');
        }
        if (!this.checkBlockSizes(state)) {
            throw Error('Blocks are not the right size');
        }
        if (!this.checkComplexBlockDisjoint(state)) {
            throw Error('Complex Blocks are not disjoint');
        }
        if (!this.checkComplexBlockInside(state)){
            throw Error('Complex Blocks are not inside');
        }
        if (!this.checkComplexBlockSizes(state)) {
            throw Error('Complex Blocks are not the right size');
        }
    }
    checkBlockDisjoint(state: Canvas) {
        let disjoint = true;
        state.blocks.forEach((block1, blockId1) => {
            state.blocks.forEach((block2, blockId2) => {
                if (blockId1 != blockId2) {
                    disjoint = disjoint && 
                                (!((block1.bottomLeft.isStrictlyInside(block2.bottomLeft, block2.topRight) 
                                || block1.topRight.isStrictlyInside(block2.bottomLeft, block2.topRight)
                                || block2.bottomLeft.isStrictlyInside(block1.bottomLeft, block1.topRight)
                                || block2.topRight.isStrictlyInside(block1.bottomLeft, block1.topRight))));
                }
            })
        })
        return disjoint;
    }

    checkBlockInside(state: Canvas) {
        let inside = true;
        let stateBottomLeft = new Point([0, 0]);
        let stateTopRight = new Point([state.width, state.height]);
        state.blocks.forEach(block => {
            inside = inside
                    && block.bottomLeft.isInside(stateBottomLeft, stateTopRight)
                    && block.topRight.isInside(stateBottomLeft, stateTopRight);
        })
        return inside;
    }

    checkBlockSizes(state: Canvas) {
        let size = 0;
        state.blocks.forEach(block => {
            size += block.size.getScalarSize();
        })
        return size === state.size.getScalarSize();
    }

    checkComplexBlockDisjoint(state: Canvas) {
        let disjoint = true;
        state.blocks.forEach(block => {
            if (block.typ === BlockType.ComplexBlockType) {
                const children = block.getChildren();
                children.forEach(block1 => {
                    children.forEach(block2 => {
                        disjoint = disjoint &&
                                (!(block1.bottomLeft.isStrictlyInside(block2.bottomLeft, block2.topRight) 
                                || block1.topRight.isStrictlyInside(block2.bottomLeft, block2.topRight)
                                || block2.bottomLeft.isStrictlyInside(block1.bottomLeft, block1.topRight)
                                || block2.topRight.isStrictlyInside(block1.bottomLeft, block1.topRight)));
                    })
                })
            }
        })
        return disjoint;
    }

    checkComplexBlockInside(state: Canvas) {
        let inside = true;
        state.blocks.forEach(block => {
            if (block.typ === BlockType.ComplexBlockType) {
                const children = block.getChildren();
                children.forEach(childBlock => {
                    inside = inside
                            && childBlock.bottomLeft.isInside(block.bottomLeft, block.topRight)
                            && childBlock.topRight.isInside(block.bottomLeft, block.topRight);
                })
            }
            
        })
        return inside;
    }

    checkComplexBlockSizes(state: Canvas) {
        let sameSize = true;
        state.blocks.forEach(block => {
            let size = 0;
            if (block.typ === BlockType.ComplexBlockType) {
                block.getChildren().forEach(childBlock => {
                    size += childBlock.size.getScalarSize();
                })
                sameSize = sameSize && (size === block.size.getScalarSize());
            }
        })
        return sameSize;
    }

    
};