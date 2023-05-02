class Grid {
    // our grid contains simple integers to represent game objects;
    // this map translates the numbers to a string, that can then be used as
    // human-readable reference or CSS class (for display purposes)
    cssClassMap = {};

    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;

        // set up grid in DOM here
        // set initial board state as empty
        this.displayState = Array(rows * columns).fill(null);

        // set up DOM references
        let boardRef = document.querySelector('#grid');
        this.gridRef = [];

        this.displayState.forEach(index => {
            // create a DOM node for each element in the backing array
            let node = document.createElement('div');

            // For games that use the mouse, set a `data-index` attribute
            // to easily reference the clicked node
            node.dataset.index = index;

            // save a reference to the node, so it can be quickly updated later
            this.gridRef.push(node);

            // add the node to the actual page
            boardRef.appendChild(node);
        });
    }

    render(nextDisplayState) {
        // get diff between current state/next state
        let diffIndices = this.displayState.reduce((accumulator, currentValue, index) => {
            let nextValue = nextDisplayState[index]
            if (nextValue !== currentValue) {
                accumulator.push(index);
            }
            return accumulator;
        }, []);

        // update DOM references
        diffIndices.forEach(index => this.gridRef[index].classList = this.cssClassMap[nextDisplayState[index]]);

        // set the next state as current state
        this.displayState = nextDisplayState;
    }
}
