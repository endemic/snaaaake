class Game extends Grid {
    // constants for representing game entities
    EMPTY = 0;
    SNAKE = 1;
    APPLE = 2;

    // translate those numbers back to human-readable format
    // to use for styling
    cssClassMap = {
        0: 'empty',
        1: 'snake',
        2: 'apple',
        3: 'debug'
    };

    constructor() {
        const rows = 50;
        const columns = 50;

        super(rows, columns);

        let nextState = this.displayStateCopy();

        // set initial background
        for (let x = 0; x < this.columns; x += 1) {
            for (let y = 0; y < this.rows; y += 1) {
                nextState[x][y] = this.EMPTY;
            }
        }

        // set up initial snake position
        this.snake = {
            position: [
                { x: 25, y: 25 }, // this is the "head" of the snake
                { x: 24, y: 25 },
                { x: 23, y: 25 },
                { x: 22, y: 25 }
            ],
            direction: 'right'
        };

        // draw the snaaake
        this.snake.position.forEach(({ x, y }) => {
            nextState[x][y] = this.SNAKE;
        });

        // create some random APPLES
        for (let i = 0; i < 10; i += 1) {
            nextState = this.makeApple(nextState);
        }

        // do initial draw
        this.render(nextState);

        this.updateScore(0);

        // bind context variable (this) to the current Game() object
        // for each of these global handlers/interval

        // add global keyboard handler
        window.addEventListener('keydown', this.onKeyDown.bind(this));

        // add touch event handler
        window.addEventListener('touchstart', this.onTouchStart.bind(this));
        window.addEventListener('touchend', this.onTouchEnd.bind(this));

        document.querySelector('#play').addEventListener('click', this.reset.bind(this));

        // update loop
        this.interval = window.setInterval(this.update.bind(this), 30);

        // these values allow us to speed up the game slightly every
        // time a player collects an apple
        this.previousTime = performance.now();
        this.updateSpeedInMs = 150;

        this.renderHighScores();
    }

    reset() {
        let nextState = this.displayStateCopy();

        // set initial background
        for (let x = 0; x < this.columns; x += 1) {
            for (let y = 0; y < this.rows; y += 1) {
                nextState[x][y] = this.EMPTY;
            }
        }

        // set up initial snake position
        this.snake = {
            position: [
                { x: 25, y: 25 }, // this is the "head" of the snake
                { x: 24, y: 25 },
                { x: 23, y: 25 },
                { x: 22, y: 25 }
            ],
            direction: 'right'
        };

        // draw the snaaake
        this.snake.position.forEach(({ x, y }) => {
            nextState[x][y] = this.SNAKE;
        });

        // create some random APPLES
        for (let i = 0; i < 10; i += 1) {
            nextState = this.makeApple(nextState);
        }

        // do initial draw
        this.render(nextState);

        // reset score
        this.score = 0;
        this.updateScore(0);

        // hide menu
        document.querySelector('#menu').style = 'display: none;';

        if (!this.interval) {
            this.interval = window.setInterval(this.update.bind(this), 30);
        }
    }

    makeApple(displayState) {
        let point = this.randomPoint();

        // if the random spot is not empty, choose another until it _is_ empty
        while (displayState[point.x][point.y] !== this.EMPTY) {
            point = this.randomPoint();
        }

        // place the apple
        displayState[point.x][point.y] = this.APPLE;

        return displayState;
    }

    ArrowLeft() {
        // can't go the opposite direction, or else you'd immediately crash
        if (this.snake.direction !== 'right') {
            this.snake.direction = 'left';
        }
    }

    ArrowRight() {
        // can't go the opposite direction, or else you'd immediately crash
        if (this.snake.direction !== 'left') {
            this.snake.direction = 'right';
        }
    }

    ArrowUp() {
        // can't go the opposite direction, or else you'd immediately crash
        if (this.snake.direction !== 'down') {
            this.snake.direction = 'up';
        }
    }

    ArrowDown() {
        // can't go the opposite direction, or else you'd immediately crash
        if (this.snake.direction !== 'up') {
            this.snake.direction = 'down';
        }
    }

    onKeyDown(event) {
        // If the `Game` component has a defined method that
        // is equal to the name of the pressed key...
        if (typeof this[event.key] === 'function') {
            // fire that method
            this[event.key]();

            event.preventDefault();
        }
    }

    onTouchStart(event) {
        // store where the player first touched the screen
        this.currentTouch = event.changedTouches[0];  // only care about the first touch
    }

    onTouchEnd(event) {
        // store local ref to last touch
        const endTouch = event.changedTouches[0];

        let xDiff = endTouch.clientX - this.currentTouch.clientX;
        let yDiff = endTouch.clientY - this.currentTouch.clientY;

        // horizontal touch direction was greater
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // user moved their finger (mostly) right
            if (xDiff > 0) {
                this.ArrowRight();
            } else {
                this.ArrowLeft();
            }
            // vertical touch direction was greater
        } else {
            // user moved their finger (mostly) down
            if (yDiff > 0) {
                this.ArrowDown();
            } else {
                this.ArrowUp();
            }
        }
    }

    update() {
        const now = performance.now();

        // if not enough time has passed since the previous update, then do nothing
        if ((now - this.previousTime) < this.updateSpeedInMs) {
            return;
        }

        this.previousTime = now;

        let nextDisplayState = this.displayStateCopy();

        // find next position
        let newSnakeHead = {
            x: this.snake.position[0].x,
            y: this.snake.position[0].y
        };

        switch (this.snake.direction) {
            case 'right':
                newSnakeHead.x += 1;
                break;
            case 'left':
                newSnakeHead.x -= 1;
                break;
            case 'up':
                newSnakeHead.y -= 1;
                break;
            case 'down':
                newSnakeHead.y += 1;
                break;
        }

        // handle screen wrap
        if (newSnakeHead.x < 0) {
            newSnakeHead.x = this.rows - 1;
        }

        if (newSnakeHead.x > this.rows - 1) {
            newSnakeHead.x = 0;
        }

        if (newSnakeHead.y < 0) {
            newSnakeHead.y = this.columns - 1;
        }

        if (newSnakeHead.y > this.columns - 1) {
            newSnakeHead.y = 0;
        }

        // check for body collision
        if (nextDisplayState[newSnakeHead.x][newSnakeHead.y] === this.SNAKE) {
            this.gameOver();
        }

        // clear snake's current position
        this.snake.position.forEach(({ x, y }) => {
            nextDisplayState[x][y] = this.EMPTY
        });

        // check for apple collision
        if (nextDisplayState[newSnakeHead.x][newSnakeHead.y] === this.APPLE) {
            // if the snake eats an apple, turn the apple into the new "head"
            // so the snake grows
            this.snake.position.unshift(newSnakeHead);

            this.updateScore(1);

            this.updateSpeedInMs -= 5;

            // make a new apple
            nextDisplayState = this.makeApple(nextDisplayState);
        } else {
            // otherwise, shift the whole snake body
            for (let i = this.snake.position.length - 1; i > 0; i -= 1) {
                // give each body segment the position of the one before it
                this.snake.position[i] = this.snake.position[i - 1];
            }

            // finally, move the head
            this.snake.position[0] = newSnakeHead;
        }

        // draw the snaaake
        this.snake.position.forEach(({ x, y }) => {
            nextDisplayState[x][y] = this.SNAKE
        });

        // update display
        this.render(nextDisplayState);
    }

    gameOver() {
        // load high scores from local storage; they're stored as a stringified array
        let highScores = JSON.parse(localStorage.getItem('highScores'));

        highScores.push({ score: this.score, timestamp: Date.now() }); // insert new high score
        highScores.sort((a, b) => a.score < b.score); // sort
        highScores.splice(5); // only keep top 5

        // save the results
        localStorage.setItem('highScores', JSON.stringify(highScores));

        // re-display high scores
        this.renderHighScores();

        // stop the update loop
        clearInterval(this.interval);
        this.interval = undefined;

        // display menu
        document.querySelector('#menu').style = 'display: block;';
    }

    updateScore(val) {
        if (this.score === undefined) {
            this.score = 0;
        }

        this.score += val;

        document.querySelector('#scoreboard').textContent = this.score;
    }

    renderHighScores() {
        // initialize high score list if necessary
        if (!localStorage.getItem('highScores')) {
            localStorage.setItem('highScores',
                JSON.stringify(
                    Array(5).fill({ score: 0, timestamp: 0 })
                )
            );
        }

        const highScores = JSON.parse(localStorage.getItem('highScores'));

        // populate high score list
        document.querySelector('#high_scores').innerHTML = `<ol>
        ${highScores.map(({ score, timestamp }) => {
            return `<li>${score} &mdash; ${new Date(timestamp).toLocaleString()}</li>`;
        }).join('')}
        </ol>`;
    }
};
