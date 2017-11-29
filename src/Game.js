import React from 'react';
import ReactDOM from 'react-dom';
import './Game.css';

const FREED = "free";
const EMPTY = "empty";
const BOMB = "bomb";
const EXPLODED = "exploded";

class Square extends React.Component {
    render() {
        return (
          <button className={this.props.bombstate+ " square"} onClick={this.props.onClick}>
            {this.props.value}
          </button>
        );
      }
}

export default class Board extends React.Component {
    constructor(props) {
        super(props);
        var n = 9;//props.boardSize;
        // init arr[n][n]
        let arr = Array(n);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = Array(n);
            for (var j = 0; j < arr.length; j++) {
                arr[i][j] = {};
                arr[i][j].bombstate = EMPTY;
                arr[i][j].value = 0;
            }
        }

        this.state = {
            firstSquareClicked: false,
            size: n,
          squares: arr,
        };
      }
    
      renderSquare(row, col) {
        return (<Square
            bombstate={this.state.squares[row][col].bombstate}
            value={this.state.squares[row][col].value}
            onClick={() => this.handleClick(row, col)}
            key={row + "-"+col}
        />);
      }

      drawBoard() {
        var rv = [];
        for (var row = 0; row < this.state.squares.length; row++) {
            var rvv = [];
            for (var col = 0; col < this.state.squares[row].length; col++) {
                rvv.push(this.renderSquare(row, col));
            }
            rv.push(<div className="board-row" key={"row-" + row}>{rvv}</div>);
        }
        return rv;
      }

        rand() {
            var min = 0;
            var max = this.state.size-1;
          return Math.floor(Math.random()*(max-min+1)+min);
      }

      handleClick(row, col) {
        console.log("Clicked " + row + ", " + col);
        const squares = this.state.squares.slice();

        // first click, add initial bombs (but not to just clicked square)
        if (!this.state.firstSquareClicked) {
            squares[row][col].bombstate = FREED;
            var bombsToPlace = 10;
            var bombsPlaced = 0;
            while (bombsPlaced < bombsToPlace) {
                var r = this.rand();
                var c = this.rand();
                if (squares[r][c].bombstate === EMPTY) {
                    squares[r][c].bombstate = BOMB;
                    bombsPlaced++;
                }
            }

            // calculate all values
            for (var r = 0;r<squares.length;r++) {
                for (var c = 0;c<squares[r].length;c++) {
                    squares[r][c].value = this.getBombsAround(r, c, squares);
                }
            }

            this.setState({firstSquareClicked: true});    
        }

        if (squares[row][col].bombstate === EMPTY) {
            squares[row][col].bombstate = FREED;
            var nrBombs = this.getBombsAround(row, col, squares);
            squares[row][col].value = nrBombs;
        } 

        if (squares[row][col].bombstate === BOMB) {
            squares[row][col].bombstate = EXPLODED;
        } 

        this.setState({squares: squares});
      }
    
      getBombsAround(row, col, squares) {
        var cnt = 0;
        for (var c = col-1;c<=col+1;c++) {
            for (var r = row-1;r<=row+1;r++) {
             cnt += this.testForBomb(r, c, squares);
            }
        }
        return cnt;
      }

      testForBomb(row, col, squares) {
          if (row < 0 || col < 0 || row > squares.length-1 || col > squares.length-1) {return 0;}
          if (squares[row][col].bombstate === BOMB)
              {return 1;}
          else 
            {return 0;}
      }

  render() {
    return (
      <div>
        {this.drawBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board boardSize="3"/>
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
