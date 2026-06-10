/* eslint-disable */

import { Point } from "./Point";

export type Color = RGBA | PngRef;

export class RGBA {
  r: number;

  g: number;
  
  b: number;

  a: number;

  constructor(rgba: [number, number, number, number] = [0, 0, 0, 0]) {
    [this.r, this.g, this.b, this.a] = rgba;
  }

  offsetColor(p1: Point, p2: Point) {
    return this;
  }
}

export class PngRef {
  bottomLeft: Point

  constructor(offset: [number, number]) {
    this.bottomLeft = new Point(offset);
  }

  offsetColor(p1: Point, p2: Point) {
    return new PngRef(this.bottomLeft.add(p2).subtract(p1).getPoints());
  }
}

  