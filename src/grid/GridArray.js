/**
 * Direction constants for 8‑directional movement.
 * @readonly
 * @enum {string}
 */
const Direction = {
    UP_LEFT: 'up-left',
    UP: 'up',
    UP_RIGHT: 'up-right',
    RIGHT: 'right',
    DOWN_RIGHT: 'down-right',
    DOWN: 'down',
    DOWN_LEFT: 'down-left',
    LEFT: 'left'
};

/**
 * A 2D grid data structure for storing items by (column, row) coordinates.
 * Items can be any JavaScript value. The grid supports dynamic resizing (add/remove rows/columns)
 * and provides convenience methods to query neighbors, iterate, filter, etc.
 *
 * @template T
 */
export default class GridArray {
    /**
     * Creates a new grid with the specified dimensions.
     * @param {number} rows - Number of rows (vertical axis).
     * @param {number} columns - Number of columns (horizontal axis).
     * @throws {Error} If rows or columns are not positive integers.
     */
    constructor(rows, columns) {
        if (!Number.isInteger(rows) || rows <= 0) throw new Error('rows must be a positive integer');
        if (!Number.isInteger(columns) || columns <= 0) throw new Error('columns must be a positive integer');

        /** @type {number} */ this.rows = rows;
        /** @type {number} */ this.columns = columns;
        /** @type {Array<Array<T|undefined>>} */ this.items = [];

        for (let i = 0; i < rows; i++) {
            this.items[i] = new Array(columns);
        }
    }

    /**
     * Adds a new empty row at the bottom.
     */
    addRow() {
        this.items.push(new Array(this.columns));
        this.rows++;
    }

    /**
     * Removes a row and shifts up all items below it.
     * @param {number} rowIndex - Index of the row to remove (0‑based).
     * @throws {Error} If rowIndex is out of bounds.
     */
    removeRow(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.rows) {
            throw new Error(`Row index ${rowIndex} out of bounds [0, ${this.rows - 1}]`);
        }
        this.items.splice(rowIndex, 1);
        this.rows--;
        // Adjust stored row indices on items that have a 'row' property
        this.items.forEach(row => {
            row.forEach(item => {
                if (item && typeof item.row === 'number' && item.row > rowIndex) {
                    item.row--;
                }
            });
        });
    }

    /**
     * Adds a new empty column at the right edge.
     */
    addColumn() {
        this.items.forEach(row => row.push(undefined));
        this.columns++;
    }

    /**
     * Removes a column and shifts left all items to the right of it.
     * @param {number} columnIndex - Index of the column to remove (0‑based).
     * @throws {Error} If columnIndex is out of bounds.
     */
    removeColumn(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.columns) {
            throw new Error(`Column index ${columnIndex} out of bounds [0, ${this.columns - 1}]`);
        }
        this.items.forEach(row => {
            row.splice(columnIndex, 1);
            row.forEach(item => {
                if (item && typeof item.column === 'number' && item.column > columnIndex) {
                    item.column--;
                }
            });
        });
        this.columns--;
    }

    /**
     * Checks whether a cell is occupied (contains a truthy value).
     * @param {number} column
     * @param {number} row
     * @returns {boolean}
     */
    checkAt(column, row) {
        return !!this.getAt(column, row);
    }

    /**
     * Returns the item at (column, row), or undefined if empty or out of bounds.
     * @param {number} column
     * @param {number} row
     * @returns {T|undefined}
     */
    getAt(column, row) {
        if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) return undefined;
        return this.items[row][column];
    }

    /**
     * Removes the item at (column, row) by setting the cell to `undefined`.
     * Does NOT shift other items.
     * @param {number} column
     * @param {number} row
     */
    removeAt(column, row) {
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            this.items[row][column] = undefined;
        }
    }

    /**
     * Removes all items from the grid (sets every cell to undefined).
     */
    removeAll() {
        this.items = Array.from({ length: this.rows }, () => new Array(this.columns));
    }

    /**
     * Adds an item at the coordinates defined by the item's own `column` and `row` properties.
     * @param {T & { column: number, row: number }} item - Must have numeric `column` and `row`.
     * @returns {boolean} True if the cell was empty and item was added.
     */
    add(item) {
        return this.addAt(item.column, item.row, item);
    }

    /**
     * Adds multiple items, each must have `column` and `row` properties.
     * @param {Array<T & { column: number, row: number }>} items
     * @returns {boolean[]} Array of success flags for each item.
     */
    addMultiple(...items) {
        return items.map(item => this.addAt(item.column, item.row, item));
    }

    /**
     * Places an item at the specified coordinates.
     * @param {number} column
     * @param {number} row
     * @param {T} item
     * @returns {boolean} True if the cell was empty and item was added.
     */
    addAt(column, row, item) {
        if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
            console.warn(`addAt: coordinates (${column}, ${row}) out of bounds`);
            return false;
        }
        if (this.checkAt(column, row)) {
            console.warn(`Slot [${column}, ${row}] is taken!`);
            return false;
        }
        this.items[row][column] = item;
        return true;
    }

    /**
     * Removes an item by reference. Assumes the item has `column` and `row` properties.
     * @param {T & { column: number, row: number }} item
     */
    remove(item) {
        this.removeAt(item.column, item.row);
    }

    /**
     * Returns a flat array of all items (including `undefined` for empty cells).
     * @returns {Array<T|undefined>}
     */
    toArray() {
        return this.items.flat();
    }

    /**
     * Returns a flat array of unique items (no duplicates, `undefined` excluded).
     * @returns {T[]}
     */
    toArrayUniq() {
        const set = new Set(this.items.flat());
        set.delete(undefined);
        return [...set];
    }

    /**
     * Gets the neighbor in a specific direction.
     * @param {number} column
     * @param {number} row
     * @param {string} direction - One of the Direction constants.
     * @returns {T|undefined}
     */
    getNeighborAtDirection(column, row, direction) {
        switch (direction) {
            case Direction.UP_LEFT:   return this.getAt(column - 1, row - 1);
            case Direction.UP:        return this.getAt(column,     row - 1);
            case Direction.UP_RIGHT:  return this.getAt(column + 1, row - 1);
            case Direction.RIGHT:     return this.getAt(column + 1, row);
            case Direction.DOWN_RIGHT:return this.getAt(column + 1, row + 1);
            case Direction.DOWN:      return this.getAt(column,     row + 1);
            case Direction.DOWN_LEFT: return this.getAt(column - 1, row + 1);
            case Direction.LEFT:      return this.getAt(column - 1, row);
            default:
                console.warn("Unknown direction!", direction);
                return undefined;
        }
    }

    /**
     * Returns an object with all 8 neighbors (may be undefined).
     * @param {number} column
     * @param {number} row
     * @returns {Object} Neighbors as topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left.
     */
    getNeighborsAt(column, row) {
        return {
            topLeft:     this.getAt(column - 1, row - 1),
            top:         this.getAt(column,     row - 1),
            topRight:    this.getAt(column + 1, row - 1),
            right:       this.getAt(column + 1, row),
            bottomRight: this.getAt(column + 1, row + 1),
            bottom:      this.getAt(column,     row + 1),
            bottomLeft:  this.getAt(column - 1, row + 1),
            left:        this.getAt(column - 1, row)
        };
    }

    /**
     * Returns only the orthogonal neighbors (up, right, down, left).
     * @param {number} column
     * @param {number} row
     * @returns {Object}
     */
    getOrthoNeighborsAt(column, row) {
        return {
            top:    this.getAt(column,     row - 1),
            right:  this.getAt(column + 1, row),
            bottom: this.getAt(column,     row + 1),
            left:   this.getAt(column - 1, row)
        };
    }

    /**
     * Returns an array of all 8 neighbor values (may include undefined).
     * @param {number} column
     * @param {number} row
     * @returns {Array<T|undefined>}
     */
    getNeighborsArrayAt(column, row) {
        return Object.values(this.getNeighborsAt(column, row));
    }

    /**
     * Returns an array of the 4 orthogonal neighbor values.
     * @param {number} column
     * @param {number} row
     * @returns {Array<T|undefined>}
     */
    getOrthoNeighborsArrayAt(column, row) {
        return [
            this.getAt(column,     row - 1),
            this.getAt(column + 1, row),
            this.getAt(column,     row + 1),
            this.getAt(column - 1, row)
        ];
    }

    /**
     * Iterates over every cell (including empty ones) with a callback.
     * @param {(item: T|undefined, column: number, row: number, grid: GridArray<T>) => void} callbackfn
     * @param {any} [thisArg]
     */
    forEach(callbackfn, thisArg) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                callbackfn.call(thisArg, this.items[r][c], c, r, this);
            }
        }
    }

    /**
     * Returns a flat array of all items (excluding empty cells) that satisfy a predicate.
     * @param {(item: T, column: number, row: number, grid: GridArray<T>) => boolean} predicate
     * @param {any} [thisArg]
     * @returns {T[]}
     */
    filter(predicate, thisArg) {
        const result = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const item = this.items[r][c];
                if (item !== undefined && predicate.call(thisArg, item, c, r, this)) {
                    result.push(item);
                }
            }
        }
        return result;
    }

    /**
     * Returns a flat array of the results of calling a mapping function on every non‑empty item.
     * @template U
     * @param {(item: T, column: number, row: number, grid: GridArray<T>) => U} callbackfn
     * @param {any} [thisArg]
     * @returns {U[]}
     */
    map(callbackfn, thisArg) {
        const result = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const item = this.items[r][c];
                if (item !== undefined) {
                    result.push(callbackfn.call(thisArg, item, c, r, this));
                }
            }
        }
        return result;
    }

    /**
     * Finds the first item that satisfies a predicate.
     * @param {(item: T) => boolean} predicate
     * @returns {T|undefined}
     */
    find(predicate) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const item = this.items[r][c];
                if (item !== undefined && predicate(item)) {
                    return item;
                }
            }
        }
        return undefined;
    }

    /**
     * Returns all items in a specific column (top to bottom), ignoring empty cells.
     * @param {number} column
     * @returns {T[]}
     */
    getItemsByColumn(column) {
        const items = [];
        for (let row = 0; row < this.rows; row++) {
            const item = this.getAt(column, row);
            if (item !== undefined && !items.includes(item)) {
                items.push(item);
            }
        }
        return items;
    }

    /**
     * Returns all items in a specific row (left to right), ignoring empty cells.
     * @param {number} row
     * @returns {T[]}
     */
    getItemsByRow(row) {
        const items = [];
        for (let column = 0; column < this.columns; column++) {
            const item = this.getAt(column, row);
            if (item !== undefined && !items.includes(item)) {
                items.push(item);
            }
        }
        return items;
    }
}