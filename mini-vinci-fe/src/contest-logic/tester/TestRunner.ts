
import { Canvas } from "../Canvas";
import { RGBA } from "../Color";
import { instructionToString } from "../Instruction";
import { Interpreter } from "../Interpreter";
import { RandomInstructionGenerator } from "../RandomInstructionGenerator";
import { ContestLogicTester } from "./ContestLogicTester";

const tester = new ContestLogicTester();

// console.log(tester.runTester(2000));


let canvas = new Canvas(400, 400, new RGBA([255, 255, 255, 255]));
let interpreter = new Interpreter();
let instructions = []
const size = 2000;
for(let move = 0; move < size  ; move++) {
    const instruction = RandomInstructionGenerator.generateRandomInstruction(canvas);
    console.log(instructionToString(instruction));
    const interpreterResult = interpreter.interpret(move, canvas, instruction, 0);
    canvas = (interpreterResult.canvas as Canvas);
    tester.checkCanvasInvariants(canvas);
}

