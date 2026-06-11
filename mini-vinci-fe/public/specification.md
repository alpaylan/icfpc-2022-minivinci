# Introduction

The mighty wizards of Lambda land have seen all your poses from last year and they were absolutely fascinated by them. They were so inspired by you that they have been discovering the secret arts of painting for the rest of the year, waiting for you to join them. Your mission, if you choose to accept it, will be to develop algorithms for robo-painters of the future. After all, there are so many paintings to make, and so little of us functional programmers to make them.

> This is a revived, self-hosted version of the ICFP Programming Contest 2022 ("RoboVinci"). Register to solve problems and appear on the live scoreboard, or just explore the problems and the [Playground](/playground) without an account.

## Problems

Each problem gives you an **initial configuration** of a canvas together with a **target painting**. Your job is to transform the initial canvas into something as close to the target as possible, at the lowest possible cost.

Most problems start from a blank canvas — a single white block. The initial configuration is a JSON document describing the canvas size and its starting blocks:

```json
{
  "width": 400,
  "height": 400,
  "blocks": [
    {
      "blockId": "0",
      "bottomLeft": [0, 0],
      "topRight": [400, 400],
      "color": [255, 255, 255, 255]
    }
  ]
}
```

Here `width` and `height` are integers, `blockId` is an integer id in double quotes, `bottomLeft` and `topRight` are `[x, y]` points, and `color` is `[r, g, b, a]`. Block ids start at `0` and run to `n-1` for `n` blocks.

Some problems start from a **pre-painted** canvas. In that case the initial configuration references pixel data from a source PNG, and a block can be filled from that PNG instead of a flat color:

```json
{
  "width": 400,
  "height": 400,
  "sourcePngJSON": "<url to the canvas' serialized RGBA data>",
  "blocks": [
    {
      "blockId": "0",
      "bottomLeft": [0, 0],
      "topRight": [400, 200],
      "color": [255, 255, 255, 255]
    },
    {
      "blockId": "1",
      "bottomLeft": [0, 200],
      "topRight": [400, 400],
      "pngBottomLeftPoint": [200, 200]
    }
  ]
}
```

In this example the bottom half of the canvas is a flat white block, while the top half (`blockId` `1`) is filled from the source PNG. `sourcePngJSON` points to serialized RGBA data the same size as the canvas, so each pixel coordinate maps directly onto the canvas.

# Problem Specification

The task is to **paint** a given **canvas** with the least **cost** and highest **similarity**.

As part of the task, you will be given;

- a set of **moves** applicable over the **canvas**,
- an **instruction language** to express your set of **moves**,
- a **cost function** for calculating the **cost** of each **move**,
- a **similarity function** for calculating the **similarity** of your **painted canvas** to the **target painting**.

As part of individual problems, you will be given;

- an initial **canvas**,
- a target **painting**.

## Canvas

Canvas is an abstract 2-dimensional pixel space of [**RGBA** channels](https://en.wikipedia.org/wiki/RGBA_color_model).

Each **move** transforms the canvas in a different sense.

After all moves are applied to a **canvas**, it can be rendered to a **painting**.

**Canvas** is made out of **blocks**.

![Canvas and block types](/spec/canvas_types.png)

### Blocks

A block is either a frame that consists of a set of sub-blocks; or a simple structure with shape and color.

A move on a block either changes the block contents, or it destroys the old block and creates new ones.

Color and Swap changes the contents of the block.

Cut and Merge destroys(takes the block out of the scope so it cannot be referenced in the latter instructions) the old block, generates new blocks.

Merge does so by creating a new top level block where the id is created by holding a global counter incremented at each merge operation, destroying the old blocks and adding them as sub-blocks inside the newly created complex block. Sub-blocks generated via merge can never be addressed. They are only used to describe colors within a block. A simple block can only have pixels of the same color, but a complex block (consisting of multiple sub-blocks) can have multiple colors.

Cut destroys the old block, generates new blocks where the id is created by appending the old id with **.0, .1, .2 or .3**. Cut blocks are now independent from the block they originated from, even though their block-id is tied with that block.

The **initial canvas** is defined according to the initial configuration provided with the problem.

Blocks are uniquely defined by their **block_id**.

## Painting

Painting is a concrete 2-dimensional pixel space of [**RGBA** channels](https://en.wikipedia.org/wiki/RGBA_color_model). For individual problems, you will be provided with **PNG** files for the paintings.

## Moves

We present you with **5** different moves you can use to paint your canvases.

### Cut Moves

Cut moves take a block, and some cut instruction over that block. Create new sub-blocks; preserving the colors.

#### Line Cut Move

A line cut move takes a block(defined by its block-id), an orientation(X or x for Vertical, Y or y for Horizontal), an offset(the 1-d coordinate for the cut operation) and creates 2 sub-blocks of the given block.

Sub-blocks of line cuts are numbered from *bottom to top, or left to right*.

![Line Cut Move Image](/spec/line_cut_move.png)

#### Point Cut Move

A point cut move takes a block(defined by its block-id), an offset(the 2-d coordinate for the cut operation) and creates 4 sub-blocks of the given block.

Sub-blocks of point cuts are numbered from *bottom left using reverse clock-wise numbering*.

![Point Cut Move Image](/spec/point_cut_move.png)

### Color Move

Color move takes a block, and some color on **RGBA** space. It changes the color content of the given block to the given color.

![Color Move Image](/spec/color_move.png)

### Swap Move

Swap move takes two blocks. It swaps the contents of the given blocks.

Blocks must have the **same shape** to be swapped.

![Swap Move Image](/spec/swap_move.png)

### Merge Move

Merge move takes two blocks. It merges the blocks by creating a new block, adding these blocks to this new block as sub-blocks.

Blocks must be **compatible** to be merged. They must be adjoint, and their adjoint sides must have the same length. Informally; the merge of the blocks must create a new rectangle.

Each time a merge operation is performed, a new block is created. The newly created block has the **block id** according to the global counter. For example, when global counter is *n*, the block generated by this merge operation will have the block id *n+1*.

![Merge Move Image](/spec/merge_move.png)

## Instruction Language

Your task is to apply a set of moves to a canvas to similarize it to a given target painting. The way you will provide these set of moves is via submitting an **ISL(Instruction Set Language)** file for each problem. **ISL code** directly corresponds to the set of moves given above.

A BNF(Backus-Naur Form) form of the ISL grammar is given at the end of this specification.

## Cost Function

Each move has a cost. The **base cost** of a move depends on its type:

| Move      | Base cost | Base cost (problems 36+) |
| --------- | --------- | ------------------------ |
| Line Cut  | 7         | 2                        |
| Point Cut | 10        | 3                        |
| Color     | 5         | 5                        |
| Swap      | 3         | 3                        |
| Merge     | 1         | 1                        |

The later problems (id 36 and above) use the reduced cut costs in the right-hand column; every other problem uses the left column.

The cost of applying a move to a block is:

```Haskell
cost(move, block, canvas) = round(base_cost(move) * size(canvas) / size(block))
```

Where `size(rectangle) = rectangle.width * rectangle.height`, and round is the nearest integer. We use the [Math.round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) function to compute the round.

The total instruction cost of a submission is the sum of these per-move costs.

## Similarity Function

After processing all moves of a submission, the system calculates the similarity of the result to the target painting.

This is done via calculating **pixel difference on RGBA Color Space** for each pixel and aggregating those results.

Pixel difference is calculated via **Euclidian Distance of RGBA Values of Pixels**. Typescript code for the calculation is given below;

```Javascript
 class RGBA {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(rgba: [number, number, number, number] = [0, 0, 0, 0]) {
      [this.r, this.g, this.b, this.a] = rgba;
    }
  }

class SimilarityChecker {
  static imageDiff(f1: RGBA[], f2: RGBA[]): number {
    let diff = 0;
    let alpha = 0.005;
    for (let index = 0; index < f1.length; index++) {
        const p1 = f1[index];
        const p2 = f2[index];
        diff += this.pixelDiff(p1, p2);
    }
    return Math.round(diff * alpha);
  }

  static pixelDiff(p1: RGBA, p2: RGBA): number {
    const rDist = (p1.r - p2.r) * (p1.r - p2.r);
    const gDist = (p1.g - p2.g) * (p1.g - p2.g);
    const bDist = (p1.b - p2.b) * (p1.b - p2.b);
    const aDist = (p1.a - p2.a) * (p1.a - p2.a);
    const distance = Math.sqrt(rDist + gDist + bDist + aDist);
    return distance;
  }
}
```

## Scoring

The score for a **problem** is the cost of your `ISL code` plus the result of the `Similarity Function`. A lower score is better.

The scoreboard first classifies participants by the number of problems they have submitted solutions to. Within each class, participants are sorted by their summed cost; then the classes themselves are sorted by the number of submitted solutions.

As a concrete example, for the participant list below:

P1: 2 problems, total cost 90
P2: 3 problems, total cost 100
P3: 2 problems, total cost 80
P4: 1 problem, total cost 50

the scoreboard would order the participants as `P2, P3, P1, P4`.

# Submission

You submit **ISL code** from the problem page in the portal. A REST API is also available (see below). Submissions are evaluated automatically and your best cost per problem is reflected on the scoreboard.

# REST API

You can use these endpoints to submit programmatically. Authenticate with the token returned by `POST /api/users/login` (send it as `Authorization: Bearer <token>`). In the examples below, replace the host with the API server this site is configured against.

`GET /api/users` — Get information about your team. Useful to verify your token works.

`POST /api/problems/$PROBLEM_ID` — Make a submission. The `multipart/form-data` body should contain your ISL file under the key `file`. Returns a submission id.

Example request:

    curl --header "Authorization: Bearer <your-token>" \
      -F file=@your.isl \
      https://minivinci-be.fly.dev/api/problems/1

`GET /api/submissions/$SUBMISSION_ID` — Retrieve information about a submission. Returns a JSON object with:

- `status`: one of `QUEUED`, `PROCESSING`, `SUCCEEDED`, or `FAILED`
- `cost`: the calculated cost, when the submission `SUCCEEDED`
- `error`: the error message, when the submission `FAILED`
- `file_url`: a link to the submitted file

`GET /api/results/user` — Retrieve your results across all problems.

# ISL Specification

ISL code is a set of *moves* over a canvas. We start with a description of the ISL grammar.

## ISL Grammar

```BNF
<program>               ::=     <program-line> | <program-line> <newline> <program>
<program-line>          ::=     <newline> | <comment> | <move>
<comment>               ::=     "#" <unicode-string>
<move>                  ::=     <pcut-move> | <lcut-move> | <color-move>
                                | <swap-move> | <merge-move>
<pcut-move>             ::=     "cut" <block> <point>
<lcut-move>             ::=     "cut" <block> <orientation> <line-number>
<color-move>            ::=     "color" <block> <color>
<swap-move>             ::=     "swap" <block> <block>
<merge-move>            ::=     "merge" <block> <block>
<orientation>           ::=     "[" <orientation-type> "]"
<orientation-type>      ::=     <vertical> | <horizontal>
<vertical>              ::=     "X" | "x"
<horizontal>            ::=     "Y" | "y"
<line-number>           ::=     "[" <number> "]"
<block>                 ::=     "[" <block-id> "]"
<point>                 ::=     "[" <x> "," <y> "]"
<color>                 ::=     "[" <r> "," <g> "," <b> "," <a> "]"
<block-id>              ::=     <id> | <id> "." <block-id>
<x> | <y>               ::=     "0", "1", "2"...
<id> | <number>         ::=     "0", "1", "2"...
<r> | <g> | <b> | <a>   ::=     "0", "1", "2"..."255"
<newline>               ::=     "\n"
```
