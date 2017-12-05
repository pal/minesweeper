import React from 'react'
import ReactDOM from 'react-dom'
import './Game.css'

const FREED = 'free'
const EMPTY = 'empty'
const BOMB = 'bomb'
const EXPLODED = 'exploded'

class Square extends React.Component {
  getValue () {
    if (this.props.bombstate === FREED && this.props.value > 0) {
      return this.props.value
    } else {
      return ''
    }
  }
  render () {
    return (
      <button className={this.props.bombstate + ' square val-' + this.props.value} onClick={this.props.onClick}>
        {this.getValue()}
      </button>
    )
  }
}

export default class Board extends React.Component {
  constructor (props) {
    super(props)
    var n = 9
    let arr = Array(n)
    for (var i = 0; i < arr.length; i++) {
      arr[i] = Array(n)
      for (var j = 0; j < arr.length; j++) {
        arr[i][j] = {}
        arr[i][j].bombstate = EMPTY
        arr[i][j].value = 0
      }
    }

    this.state = {
      firstSquareClicked: false,
      nonBombCells: (9 * 9 - 10),
      freedCells: 0,
      size: n,
      squares: arr
    }
  }

  renderSquare (row, col) {
    return (<Square
      bombstate={this.state.squares[row][col].bombstate}
      value={this.state.squares[row][col].value}
      onClick={() => this.handleClick(row, col)}
      key={row + '-' + col}
        />)
  }

  drawBoard () {
    var rv = []
    for (var row = 0; row < this.state.squares.length; row++) {
      var rvv = []
      for (var col = 0; col < this.state.squares[row].length; col++) {
        rvv.push(this.renderSquare(row, col))
      }
      rv.push(<div className='board-row' key={'row-' + row}>{rvv}</div>)
    }
    return rv
  }

  rand () {
    var min = 0
    var max = this.state.size - 1
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  handleClick (row, col) {
    console.log('Clicked ' + row + ', ' + col)
    const squares = this.state.squares.slice()

    // first click, add initial bombs (but not to just clicked square)
    if (!this.state.firstSquareClicked) {
      squares[row][col].bombstate = FREED
      let bombsToPlace = 10
      let bombsPlaced = 0
      while (bombsPlaced < bombsToPlace) {
        let r = this.rand()
        let c = this.rand()
        if (squares[r][c].bombstate === EMPTY) {
          squares[r][c].bombstate = BOMB
          bombsPlaced++
        }
      }

      // calculate all values
      for (let r = 0; r < squares.length; r++) {
        for (let c = 0; c < squares[r].length; c++) {
          squares[r][c].value = this.getBombsAround(r, c, squares)
        }
      }

      this.setState({firstSquareClicked: true})
    }

    // Handle click
    if (squares[row][col].bombstate === EMPTY || squares[row][col].bombstate === FREED) {
      squares[row][col].bombstate = FREED
      // clear all surrounding 0's
      if (squares[row][col].value === 0) {
        this.clearSurroundingZeroes(row, col, squares)
      }
    }

    this.setState({squares: squares})
    if (squares[row][col].bombstate === BOMB) {
      squares[row][col].bombstate = EXPLODED
      this.setState({squares: squares})
      this.looseTheGame()
    }

    // Check win / progress
    let freeCells = this.countFreedCells(squares)
    this.setState({freedCells: freeCells})
    if (freeCells === this.state.nonBombCells) {
      this.winTheGame()
    }
  }

  winTheGame () {
    window.alert('WIN!')
  }

  looseTheGame () {
    window.alert('FAIL!')
  }

  // For all cells surrounding row,col, call fn for each cell
  callSurroundingCells (row, col, squares, fn) {
    for (var r = row - 1; r <= row + 1; r++) {
      for (var c = col - 1; c <= col + 1; c++) {
        console.log('checking surrounding cell: ' + r + ',' + c)
        if (this.isValidCell(r, c, squares)) {
          fn(r, c, this)
        }
      }
    }
  }

  clearSurroundingZeroes (row, col, squares) {
    // check all surrounding cells for zeroes, if there are any, call this same function for them
    // yes, this could use a flag for already checked cells, but (my) time is of the essence! :D
    // We should also free adjacent, non-bomb cells
    this.callSurroundingCells(row, col, squares, function (r, c, self) {
      if (squares[r][c].bombstate === EMPTY) {
        squares[r][c].bombstate = FREED
        if (squares[r][c].value === 0) {
          self.clearSurroundingZeroes(r, c, squares)
          self.clearSurroundingNonBombs(r, c, squares)
        }
      }
    })
  }

  clearSurroundingNonBombs (row, col, squares) {
    this.callSurroundingCells(row, col, squares, function (r, c, self) {
      if (squares[r][c].bombstate !== BOMB) {
        squares[r][c].bombstate = FREED
      }
    })
  }

  getBombsAround (row, col, squares) {
    var cnt = 0
    for (var c = col - 1; c <= col + 1; c++) {
      for (var r = row - 1; r <= row + 1; r++) {
        if (this.cellHasState(r, c, squares, BOMB)) {
          cnt++
        }
      }
    }
    return cnt
  }

  countFreedCells (squares) {
    var cnt = 0
    for (let r = 0; r < squares.length; r++) {
      for (let c = 0; c < squares[r].length; c++) {
        if (this.cellHasState(r, c, squares, FREED)) {
          cnt++
        }
      }
    }
    return cnt
  }

  isValidCell (row, col, squares) {
    return !(row < 0 || col < 0 || row > squares.length - 1 || col > squares.length - 1)
  }

  // refactor with testForBomb
  cellHasValue (row, col, squares, myValue) {
    return (this.isValidCell(row, col, squares)) && (squares[row][col].value === myValue)
  }

  cellHasState (row, col, squares, myState) {
    return (this.isValidCell(row, col, squares)) && (squares[row][col].bombstate === myState)
  }

  render () {
    return (
      <div>
        Freed: {this.state.freedCells} / {this.state.nonBombCells}<br />
        {this.drawBoard()}
      </div>
    )
  }
}

class Game extends React.Component {
  render () {
    return (
      <div className='game'>
        <div className='game-board'>
          <Board boardSize='3' />
        </div>
        <div className='game-info'>
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)
