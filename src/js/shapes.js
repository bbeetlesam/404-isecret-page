// Max. shape dimension: 3x3
// Could be tetrominoes, trominoes, or dominoes

const Shapes = {
    T: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 1, y: 1}
    ],
    L: [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2}
    ],
    Z: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1}
    ],
    S: [
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 1, y: 0},
        {x: 2, y: 0}
    ],
    Square2: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1}
    ],
    Plus: [
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 1, y: 2},
        {x: 2, y: 1}
    ],
}

export default Shapes;