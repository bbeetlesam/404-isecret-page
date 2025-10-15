// shapesPatterns.js (simplified)
// Simple backtracking tiler that DOES NOT rotate or mirror shapes.
// Each shape is placed exactly as defined in the Shapes map.
// The algorithm anchors one cell of a shape to the first empty grid cell and
// tries to fill the W x H grid. It returns an array of pattern objects
// mapping shapeName -> count (no placement coordinates).

import Shapes from './shapes.js';

function cellKey(x, y) {
	return `${x},${y}`;
}

function fits(cells, ox, oy, W, H, occupied) {
	for (const c of cells) {
		const x = c.x + ox;
		const y = c.y + oy;
		if (x < 0 || y < 0 || x >= W || y >= H) return false;
		if (occupied.has(cellKey(x, y))) return false;
	}
	return true;
}

function mark(cells, ox, oy, occupied, on) {
	for (const c of cells) {
		const k = cellKey(c.x + ox, c.y + oy);
		if (on) occupied.add(k); else occupied.delete(k);
	}
}

function patternKey(pattern) {
	return Object.keys(pattern).sort().map(k => `${k}:${pattern[k]}`).join('|');
}

export function generatePatterns(W, H, options = {}) {
	const shapesMap = options.shapes || Shapes;
	const limit = options.limit || 2000;

	const occupied = new Set();
	const results = new Map();

	function firstEmpty() {
		for (let y = 0; y < H; y++) {
			for (let x = 0; x < W; x++) {
				if (!occupied.has(cellKey(x, y))) return { x, y };
			}
		}
		return null;
	}

	function backtrack(pattern) {
		if (results.size >= limit) return;
		const empty = firstEmpty();
		if (!empty) {
			const key = patternKey(pattern);
			if (!results.has(key)) results.set(key, { ...pattern });
			return;
		}

		const { x: ex, y: ey } = empty;

		for (const [name, shapeCells] of Object.entries(shapesMap)) {
			for (let anchorIdx = 0; anchorIdx < shapeCells.length; anchorIdx++) {
				const anchor = shapeCells[anchorIdx];
				const ox = ex - anchor.x;
				const oy = ey - anchor.y;

				if (!fits(shapeCells, ox, oy, W, H, occupied)) continue;

				mark(shapeCells, ox, oy, occupied, true);
				pattern[name] = (pattern[name] || 0) + 1;

				backtrack(pattern);

				pattern[name] -= 1;
				if (pattern[name] === 0) delete pattern[name];
				mark(shapeCells, ox, oy, occupied, false);

				if (results.size >= limit) return;
			}
		}
	}

	backtrack({});

	return Array.from(results.values());
}

export function generateDefaultPatterns(W, H, opts = {}) {
	return generatePatterns(W, H, { ...opts });
}

export default { generatePatterns, generateDefaultPatterns };

// Return a flattened list of shape keys for one chosen pattern.
// Example: ['T','T','Square2']
export function generateStackoList(W, H, opts = {}) {
	const patterns = generatePatterns(W, H, opts);
	if (!patterns || patterns.length === 0) return [];
	const chosen = patterns[0];
	const list = [];
	for (const [k, v] of Object.entries(chosen)) {
		for (let i = 0; i < v; i++) list.push(k);
	}
	return list;
}
