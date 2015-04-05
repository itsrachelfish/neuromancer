if (typeof require != "undefined") {
  var chai = require('chai');
  var Chess = require('../chess').Chess;
}
var assert = chai.assert;


if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}


suite("Single Square Move Generation", function() {

  var positions = [
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      square: 'e2', verbose: false, moves: ['e3', 'e4']},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      square: 'e9', verbose: false, moves: []},  // invalid square
    {fen: 'rnbqk1nr/pppp1ppp/4p3/8/1b1P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 2 3',
      square: 'c3', verbose: false, moves: []},  // pinned piece
    {fen: '8/k7/8/8/8/8/7p/K7 b - - 0 1',
      square: 'h2', verbose: false, moves: ['h1=Q+', 'h1=R+', 'h1=B', 'h1=N']},  // promotion
    {fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R w KQ - 0 8',
      square: 'e1', verbose: false, moves: ['Kf1', 'Kd1', 'O-O', 'O-O-O']},  // castling
    {fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R w - - 0 8',
      square: 'e1', verbose: false, moves: ['Kf1', 'Kd1']},  // no castling
    {fen: '8/7K/8/8/1R6/k7/1R1p4/8 b - - 0 1',
      square: 'a3', verbose: false, moves: []},  // trapped king
    {fen: '8/7K/8/8/1R6/k7/1R1p4/8 b - - 0 1',
      square: 'd2', verbose: true,
      moves:
        [{color:'b', from:'d2', to:'d1', flags:'np', piece:'p', promotion:'q', san:'d1=Q'},
         {color:'b', from:'d2', to:'d1', flags:'np', piece:'p', promotion:'r', san:'d1=R'},
         {color:'b', from:'d2', to:'d1', flags:'np', piece:'p', promotion:'b', san:'d1=B'},
         {color:'b', from:'d2', to:'d1', flags:'np', piece:'p', promotion:'n', san:'d1=N'}]
    }, // verbose
    {fen: 'rnbqk2r/ppp1pp1p/5n1b/3p2pQ/1P2P3/B1N5/P1PP1PPP/R3KBNR b KQkq - 3 5',
      square: 'f1', verbose: true, moves: []},  // issue #30
  ];

  positions.forEach(function(position) {
    var chess = new Chess();
    chess.load(position.fen);

    test(position.fen + ' ' + position.square, function() {

      var moves = chess.moves({square: position.square, verbose: position.verbose});
      var passed = position.moves.length == moves.length;

      for (var j = 0; j < moves.length; j++) {
        if (!position.verbose) {
          passed = passed && moves[j] == position.moves[j];
        } else {
          for (var k in moves[j]) {
            passed = passed && moves[j][k] == position.moves[j][k];
          }
        }
      }
      assert(passed);

    });

  });

});

suite("Algebraic Notation", function() {

  var positions = [
    {fen: '7k/3R4/3p2Q1/6Q1/2N1N3/8/8/3R3K w - - 0 1',
     moves: ['Rd8#', 'Re7', 'Rf7', 'Rg7', 'Rh7#', 'R7xd6', 'Rc7', 'Rb7', 'Ra7',
             'Qf7', 'Qe8#', 'Qg7#', 'Qg8#', 'Qh7#', 'Q6h6#', 'Q6h5#', 'Q6f5',
             'Q6f6#', 'Qe6', 'Qxd6', 'Q5f6#', 'Qe7', 'Qd8#', 'Q5h6#', 'Q5h5#',
             'Qh4#', 'Qg4', 'Qg3', 'Qg2', 'Qg1', 'Qf4', 'Qe3', 'Qd2', 'Qc1',
             'Q5f5', 'Qe5+', 'Qd5', 'Qc5', 'Qb5', 'Qa5', 'Na5', 'Nb6', 'Ncxd6',
             'Ne5', 'Ne3', 'Ncd2', 'Nb2', 'Na3', 'Nc5', 'Nexd6', 'Nf6', 'Ng3',
             'Nf2', 'Ned2', 'Nc3', 'Rd2', 'Rd3', 'Rd4', 'Rd5', 'R1xd6', 'Re1',
             'Rf1', 'Rg1', 'Rc1', 'Rb1', 'Ra1', 'Kg2', 'Kh2', 'Kg1']},
    {fen: '1r3k2/P1P5/8/8/8/8/8/R3K2R w KQ - 0 1',
     moves: ['a8=Q', 'a8=R', 'a8=B', 'a8=N', 'axb8=Q+', 'axb8=R+', 'axb8=B',
             'axb8=N', 'c8=Q+', 'c8=R+', 'c8=B', 'c8=N', 'cxb8=Q+', 'cxb8=R+',
             'cxb8=B', 'cxb8=N', 'Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Rb1',
             'Rc1', 'Rd1', 'Kd2', 'Ke2', 'Kf2', 'Kf1', 'Kd1', 'Rh2', 'Rh3',
             'Rh4', 'Rh5', 'Rh6', 'Rh7', 'Rh8+', 'Rg1', 'Rf1+', 'O-O+',
             'O-O-O']},
    {fen: '5rk1/8/8/8/8/8/2p5/R3K2R w KQ - 0 1',
     moves: ['Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Ra7', 'Ra8', 'Rb1', 'Rc1',
             'Rd1', 'Kd2', 'Ke2', 'Rh2', 'Rh3', 'Rh4', 'Rh5', 'Rh6', 'Rh7',
             'Rh8+', 'Rg1+', 'Rf1']},
    {fen: '5rk1/8/8/8/8/8/2p5/R3K2R b KQ - 0 1',
     moves: ['Rf7', 'Rf6', 'Rf5', 'Rf4', 'Rf3', 'Rf2', 'Rf1+', 'Re8+', 'Rd8',
             'Rc8', 'Rb8', 'Ra8', 'Kg7', 'Kf7', 'c1=Q+', 'c1=R+', 'c1=B',
             'c1=N']},
    {fen: 'r3k2r/p2pqpb1/1n2pnp1/2pPN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R w KQkq c6 0 2',
     moves: ['gxh3', 'Qxf6', 'Qxh3', 'Nxd7', 'Nxf7', 'Nxg6', 'dxc6', 'dxe6',
             'Rg1', 'Rf1', 'Ke2', 'Kf1', 'Kd1', 'Rb1', 'Rc1', 'Rd1', 'g3',
             'g4', 'Be3', 'Bf4', 'Bg5', 'Bh6', 'Bc1', 'b3', 'a3', 'a4', 'Qf4',
             'Qf5', 'Qg4', 'Qh5', 'Qg3', 'Qe2', 'Qd1', 'Qe3', 'Qd3', 'Na4',
             'Nb5', 'Ne2', 'Nd1', 'Nb1', 'Nc6', 'Ng4', 'Nd3', 'Nc4', 'd6',
             'O-O', 'O-O-O']},
    {fen: 'k7/8/K7/8/3n3n/5R2/3n4/8 b - - 0 1',
     moves: ['N2xf3', 'Nhxf3', 'Nd4xf3', 'N2b3', 'Nc4', 'Ne4', 'Nf1', 'Nb1',
             'Nhf5', 'Ng6', 'Ng2', 'Nb5', 'Nc6', 'Ne6', 'Ndf5', 'Ne2', 'Nc2',
             'N4b3', 'Kb8']},
  ];

  positions.forEach(function(position) {
    var chess = new Chess();
    var passed = true;
    chess.load(position.fen);

    test(position.fen, function() {
      var moves = chess.moves();
      if (moves.length != position.moves.length) {
        passed = false;
      } else {
        for (var j = 0; j < moves.length; j++) {
          if (position.moves.indexOf(moves[j]) == -1) {
            passed = false;
            break;
          }
        }
      }
      assert(passed);
    });

  });

});


suite("Get/Put/Remove", function() {

  var chess = new Chess();
  var passed = true;
  var positions = [
    {pieces: {a7: {type: chess.PAWN, color: chess.WHITE},
              b7: {type: chess.PAWN, color: chess.BLACK},
              c7: {type: chess.KNIGHT, color: chess.WHITE},
              d7: {type: chess.KNIGHT, color: chess.BLACK},
              e7: {type: chess.BISHOP, color: chess.WHITE},
              f7: {type: chess.BISHOP, color: chess.BLACK},
              g7: {type: chess.ROOK, color: chess.WHITE},
              h7: {type: chess.ROOK, color: chess.BLACK},
              a6: {type: chess.QUEEN, color: chess.WHITE},
              b6: {type: chess.QUEEN, color: chess.BLACK},
              a4: {type: chess.KING, color: chess.WHITE},
              h4: {type: chess.KING, color: chess.BLACK}},
     should_pass: true},

    {pieces: {a7: {type: 'z', color: chess.WHTIE}}, // bad piece
     should_pass: false},

    {pieces: {j4: {type: chess.PAWN, color: chess.WHTIE}}, // bad square
     should_pass: false},

    /* disallow two kings (black) */
    {pieces: {a7: {type: chess.KING, color: chess.BLACK},
              h2: {type: chess.KING, color: chess.WHITE},
              a8: {type: chess.KING, color: chess.BLACK}},
      should_pass: false},

    /* disallow two kings (white) */
    {pieces: {a7: {type: chess.KING, color: chess.BLACK},
              h2: {type: chess.KING, color: chess.WHITE},
              h1: {type: chess.KING, color: chess.WHITE}},
      should_pass: false},

    /* allow two kings if overwriting the exact same square */
    {pieces: {a7: {type: chess.KING, color: chess.BLACK},
              h2: {type: chess.KING, color: chess.WHITE},
              h2: {type: chess.KING, color: chess.WHITE}},
      should_pass: true},
  ];

  positions.forEach(function(position) {

    passed = true;
    chess.clear();

    test("position should pass - " + position.should_pass, function() {

      /* places the pieces */
      for (var square in position.pieces) {
        passed &= chess.put(position.pieces[square], square);
      }

      /* iterate over every square to make sure get returns the proper
       * piece values/color
       */
      for (var j = 0; j < chess.SQUARES.length; j++) {
        var square = chess.SQUARES[j];
        if (!(square in position.pieces)) {
          if (chess.get(square)) {
            passed = false;
            break;
          }
        } else {
          var piece = chess.get(square);
          if (!(piece &&
              piece.type == position.pieces[square].type &&
              piece.color == position.pieces[square].color)) {
            passed = false;
            break;
          }
        }
      }

      if (passed) {
        /* remove the pieces */
        for (var j = 0; j < chess.SQUARES.length; j++) {
          var square = chess.SQUARES[j];
          var piece = chess.remove(square);
          if ((!(square in position.pieces)) && piece) {
            passed = false;
            break;
          }

          if (piece &&
             (position.pieces[square].type != piece.type ||
              position.pieces[square].color != piece.color)) {
            passed = false;
            break;
          }
        }
      }

      /* finally, check for an empty board */
      passed = passed && (chess.fen() == '8/8/8/8/8/8/8/8 w - - 0 1');

      /* some tests should fail, so make sure we're supposed to pass/fail each
       * test
       */
      passed = (passed == position.should_pass);

      assert(passed);
    });

  });

});


suite("FEN", function() {

  var positions = [
    {fen: '8/8/8/8/8/8/8/8 w - - 0 1', should_pass: true},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', should_pass: true},
    {fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', should_pass: true},
    {fen: '1nbqkbn1/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', should_pass: true},

    /* incomplete FEN string */
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1', should_pass: false},

    /* bad digit (9)*/
    {fen: 'rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', should_pass: false},

    /* bad piece (X)*/
    {fen: '1nbqkbn1/pppp1ppX/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', should_pass: false},
  ];

  positions.forEach(function(position) {
    var chess = new Chess();

    test(position.fen + ' (' + position.should_pass + ')', function() {
      chess.load(position.fen);
      assert(chess.fen() == position.fen == position.should_pass);
    });

  });

});


suite("Make Move", function() {

  var positions = [
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     legal: true,
     move: 'e4',
     next: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     legal: true,
     move: 'Nc3',
     next: 'rnbqkbnr/pppppppp/8/8/8/2N5/PPPPPPPP/R1BQKBNR b KQkq - 1 1'},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     legal: true,
     move: 'Nb1c3',
     next: 'rnbqkbnr/pppppppp/8/8/8/2N5/PPPPPPPP/R1BQKBNR b KQkq - 1 1'},
    {fen: '3R1B2/8/1B1rqr2/3qk2R/1R1rqr1B/8/3BR3/K7 b KQkq - 3 2',
     legal: true,
     move: 'R6f5',
     next: '3R1B2/8/1B1rq3/3qkr1R/1R1rqr1B/8/3BR3/K7 w KQkq - 4 3'},
    {fen: '3R1B2/8/1B1rqr2/3qk2R/1R1rqr1B/8/3BR3/K7 b KQkq - 3 2',
     legal: true,
     move: 'Rf6f5',
     next: '3R1B2/8/1B1rq3/3qkr1R/1R1rqr1B/8/3BR3/K7 w KQkq - 4 3'},
    {fen: '3R4/6B1/1B1r1q2/3qkr1R/1R1rqr1B/8/3BR3/K7 w KQkq - 6 4',
     legal: true,
     move: 'Re8+',
     next: '4R3/6B1/1B1r1q2/3qkr1R/1R1rqr1B/8/3BR3/K7 b KQkq - 7 4'},
    {fen: '3R4/6B1/1B1r1q2/3qkr1R/1R1rqr1B/8/3BR3/K7 w KQkq - 6 4',
     legal: true,
     move: 'Rde8+',
     next: '4R3/6B1/1B1r1q2/3qkr1R/1R1rqr1B/8/3BR3/K7 b KQkq - 7 4'},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     legal: false,
     move: 'e5'},
    {fen: '7k/3R4/3p2Q1/6Q1/2N1N3/8/8/3R3K w - - 0 1',
     legal: true,
     move: 'Rd8#',
     next: '3R3k/8/3p2Q1/6Q1/2N1N3/8/8/3R3K b - - 1 1'},
    {fen: 'rnbqkbnr/pp3ppp/2pp4/4pP2/4P3/8/PPPP2PP/RNBQKBNR w KQkq e6 0 1',
     legal: true,
     move: 'fxe6',
     next: 'rnbqkbnr/pp3ppp/2ppP3/8/4P3/8/PPPP2PP/RNBQKBNR b KQkq - 0 1',
     captured: 'p'},
    {fen: 'rnbqkbnr/pppp2pp/8/4p3/4Pp2/2PP4/PP3PPP/RNBQKBNR b KQkq e3 0 1',
     legal: true,
     move: 'fxe3',
     next: 'rnbqkbnr/pppp2pp/8/4p3/8/2PPp3/PP3PPP/RNBQKBNR w KQkq - 0 2',
     captured: 'p'}
  ];

  positions.forEach(function(position) {
    var chess = new Chess();
    chess.load(position.fen);
    test(position.fen + ' (' + position.move + ' ' + position.legal + ')', function() {
      var result = chess.move(position.move);
      if (position.legal) {
        // console.log(chess.fen());
        assert(result
               && chess.fen() == position.next
               && result.captured == position.captured);
      } else {
        assert(!result);
      }
    });

  });

});

suite("History", function() {

  var chess = new Chess();
  var tests = [
     {verbose: false,
      fen: '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41',
      moves: ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6',
              'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6',
              'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5', 'O-O', 'Ra7',
              'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4', 'd4', 'f4', 'Qe7',
              'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5', 'f5', 'exf5',
              'Rxf5', 'Nh7', 'Rcf1', 'Qd8', 'Qg3', 'Re7', 'h4', 'Rbb7', 'e6', 'Rbc7',
              'Qe5', 'Qe8', 'a4', 'Qd8', 'R1f2', 'Qe8', 'R2f3', 'Qd8', 'Bd3', 'Qe8',
              'Qe4', 'Nf6', 'Rxf6', 'gxf6', 'Rxf6', 'Kg8', 'Bc4', 'Kh8', 'Qf4']},
     {verbose: true,
      fen: '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41',
      moves: [
        {color: 'w', from: 'c2', to: 'c4', flags: 'b', piece: 'p', san: 'c4'},
        {color: 'b', from: 'e7', to: 'e6', flags: 'n', piece: 'p', san: 'e6'},
        {color: 'w', from: 'g1', to: 'f3', flags: 'n', piece: 'n', san: 'Nf3'},
        {color: 'b', from: 'd7', to: 'd5', flags: 'b', piece: 'p', san: 'd5'},
        {color: 'w', from: 'd2', to: 'd4', flags: 'b', piece: 'p', san: 'd4'},
        {color: 'b', from: 'g8', to: 'f6', flags: 'n', piece: 'n', san: 'Nf6'},
        {color: 'w', from: 'b1', to: 'c3', flags: 'n', piece: 'n', san: 'Nc3'},
        {color: 'b', from: 'f8', to: 'e7', flags: 'n', piece: 'b', san: 'Be7'},
        {color: 'w', from: 'c1', to: 'g5', flags: 'n', piece: 'b', san: 'Bg5'},
        {color: 'b', from: 'e8', to: 'g8', flags: 'k', piece: 'k', san: 'O-O'},
        {color: 'w', from: 'e2', to: 'e3', flags: 'n', piece: 'p', san: 'e3'},
        {color: 'b', from: 'h7', to: 'h6', flags: 'n', piece: 'p', san: 'h6'},
        {color: 'w', from: 'g5', to: 'h4', flags: 'n', piece: 'b', san: 'Bh4'},
        {color: 'b', from: 'b7', to: 'b6', flags: 'n', piece: 'p', san: 'b6'},
        {color: 'w', from: 'c4', to: 'd5', flags: 'c', piece: 'p', captured: 'p', san: 'cxd5'},
        {color: 'b', from: 'f6', to: 'd5', flags: 'c', piece: 'n', captured: 'p', san: 'Nxd5'},
        {color: 'w', from: 'h4', to: 'e7', flags: 'c', piece: 'b', captured: 'b', san: 'Bxe7'},
        {color: 'b', from: 'd8', to: 'e7', flags: 'c', piece: 'q', captured: 'b', san: 'Qxe7'},
        {color: 'w', from: 'c3', to: 'd5', flags: 'c', piece: 'n', captured: 'n', san: 'Nxd5'},
        {color: 'b', from: 'e6', to: 'd5', flags: 'c', piece: 'p', captured: 'n', san: 'exd5'},
        {color: 'w', from: 'a1', to: 'c1', flags: 'n', piece: 'r', san: 'Rc1'},
        {color: 'b', from: 'c8', to: 'e6', flags: 'n', piece: 'b', san: 'Be6'},
        {color: 'w', from: 'd1', to: 'a4', flags: 'n', piece: 'q', san: 'Qa4'},
        {color: 'b', from: 'c7', to: 'c5', flags: 'b', piece: 'p', san: 'c5'},
        {color: 'w', from: 'a4', to: 'a3', flags: 'n', piece: 'q', san: 'Qa3'},
        {color: 'b', from: 'f8', to: 'c8', flags: 'n', piece: 'r', san: 'Rc8'},
        {color: 'w', from: 'f1', to: 'b5', flags: 'n', piece: 'b', san: 'Bb5'},
        {color: 'b', from: 'a7', to: 'a6', flags: 'n', piece: 'p', san: 'a6'},
        {color: 'w', from: 'd4', to: 'c5', flags: 'c', piece: 'p', captured: 'p', san: 'dxc5'},
        {color: 'b', from: 'b6', to: 'c5', flags: 'c', piece: 'p', captured: 'p', san: 'bxc5'},
        {color: 'w', from: 'e1', to: 'g1', flags: 'k', piece: 'k', san: 'O-O'},
        {color: 'b', from: 'a8', to: 'a7', flags: 'n', piece: 'r', san: 'Ra7'},
        {color: 'w', from: 'b5', to: 'e2', flags: 'n', piece: 'b', san: 'Be2'},
        {color: 'b', from: 'b8', to: 'd7', flags: 'n', piece: 'n', san: 'Nd7'},
        {color: 'w', from: 'f3', to: 'd4', flags: 'n', piece: 'n', san: 'Nd4'},
        {color: 'b', from: 'e7', to: 'f8', flags: 'n', piece: 'q', san: 'Qf8'},
        {color: 'w', from: 'd4', to: 'e6', flags: 'c', piece: 'n', captured: 'b', san: 'Nxe6'},
        {color: 'b', from: 'f7', to: 'e6', flags: 'c', piece: 'p', captured: 'n', san: 'fxe6'},
        {color: 'w', from: 'e3', to: 'e4', flags: 'n', piece: 'p', san: 'e4'},
        {color: 'b', from: 'd5', to: 'd4', flags: 'n', piece: 'p', san: 'd4'},
        {color: 'w', from: 'f2', to: 'f4', flags: 'b', piece: 'p', san: 'f4'},
        {color: 'b', from: 'f8', to: 'e7', flags: 'n', piece: 'q', san: 'Qe7'},
        {color: 'w', from: 'e4', to: 'e5', flags: 'n', piece: 'p', san: 'e5'},
        {color: 'b', from: 'c8', to: 'b8', flags: 'n', piece: 'r', san: 'Rb8'},
        {color: 'w', from: 'e2', to: 'c4', flags: 'n', piece: 'b', san: 'Bc4'},
        {color: 'b', from: 'g8', to: 'h8', flags: 'n', piece: 'k', san: 'Kh8'},
        {color: 'w', from: 'a3', to: 'h3', flags: 'n', piece: 'q', san: 'Qh3'},
        {color: 'b', from: 'd7', to: 'f8', flags: 'n', piece: 'n', san: 'Nf8'},
        {color: 'w', from: 'b2', to: 'b3', flags: 'n', piece: 'p', san: 'b3'},
        {color: 'b', from: 'a6', to: 'a5', flags: 'n', piece: 'p', san: 'a5'},
        {color: 'w', from: 'f4', to: 'f5', flags: 'n', piece: 'p', san: 'f5'},
        {color: 'b', from: 'e6', to: 'f5', flags: 'c', piece: 'p', captured: 'p', san: 'exf5'},
        {color: 'w', from: 'f1', to: 'f5', flags: 'c', piece: 'r', captured: 'p', san: 'Rxf5'},
        {color: 'b', from: 'f8', to: 'h7', flags: 'n', piece: 'n', san: 'Nh7'},
        {color: 'w', from: 'c1', to: 'f1', flags: 'n', piece: 'r', san: 'Rcf1'},
        {color: 'b', from: 'e7', to: 'd8', flags: 'n', piece: 'q', san: 'Qd8'},
        {color: 'w', from: 'h3', to: 'g3', flags: 'n', piece: 'q', san: 'Qg3'},
        {color: 'b', from: 'a7', to: 'e7', flags: 'n', piece: 'r', san: 'Re7'},
        {color: 'w', from: 'h2', to: 'h4', flags: 'b', piece: 'p', san: 'h4'},
        {color: 'b', from: 'b8', to: 'b7', flags: 'n', piece: 'r', san: 'Rbb7'},
        {color: 'w', from: 'e5', to: 'e6', flags: 'n', piece: 'p', san: 'e6'},
        {color: 'b', from: 'b7', to: 'c7', flags: 'n', piece: 'r', san: 'Rbc7'},
        {color: 'w', from: 'g3', to: 'e5', flags: 'n', piece: 'q', san: 'Qe5'},
        {color: 'b', from: 'd8', to: 'e8', flags: 'n', piece: 'q', san: 'Qe8'},
        {color: 'w', from: 'a2', to: 'a4', flags: 'b', piece: 'p', san: 'a4'},
        {color: 'b', from: 'e8', to: 'd8', flags: 'n', piece: 'q', san: 'Qd8'},
        {color: 'w', from: 'f1', to: 'f2', flags: 'n', piece: 'r', san: 'R1f2'},
        {color: 'b', from: 'd8', to: 'e8', flags: 'n', piece: 'q', san: 'Qe8'},
        {color: 'w', from: 'f2', to: 'f3', flags: 'n', piece: 'r', san: 'R2f3'},
        {color: 'b', from: 'e8', to: 'd8', flags: 'n', piece: 'q', san: 'Qd8'},
        {color: 'w', from: 'c4', to: 'd3', flags: 'n', piece: 'b', san: 'Bd3'},
        {color: 'b', from: 'd8', to: 'e8', flags: 'n', piece: 'q', san: 'Qe8'},
        {color: 'w', from: 'e5', to: 'e4', flags: 'n', piece: 'q', san: 'Qe4'},
        {color: 'b', from: 'h7', to: 'f6', flags: 'n', piece: 'n', san: 'Nf6'},
        {color: 'w', from: 'f5', to: 'f6', flags: 'c', piece: 'r', captured: 'n', san: 'Rxf6'},
        {color: 'b', from: 'g7', to: 'f6', flags: 'c', piece: 'p', captured: 'r', san: 'gxf6'},
        {color: 'w', from: 'f3', to: 'f6', flags: 'c', piece: 'r', captured: 'p', san: 'Rxf6'},
        {color: 'b', from: 'h8', to: 'g8', flags: 'n', piece: 'k', san: 'Kg8'},
        {color: 'w', from: 'd3', to: 'c4', flags: 'n', piece: 'b', san: 'Bc4'},
        {color: 'b', from: 'g8', to: 'h8', flags: 'n', piece: 'k', san: 'Kh8'},
        {color: 'w', from: 'e4', to: 'f4', flags: 'n', piece: 'q', san: 'Qf4'}],
      fen: '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41'}
  ];

  tests.forEach(function(t, i) {
    var passed = true;

    test(i, function() {
      chess.reset();

      for (var j = 0; j < t.moves.length; j++) {
        chess.move(t.moves[j])
      }

      var history = chess.history({verbose: t.verbose});
      if (t.fen != chess.fen()) {
        passed = false;
      } else if (history.length != t.moves.length) {
        passed = false;
      } else {
        for (var j = 0; j < t.moves.length; j++) {
          if (!t.verbose) {
            if (history[j] != t.moves[j]) {
              passed = false;
              break;
            }
          } else {
            for (var key in history[j]) {
              if (history[j][key] != t.moves[j][key]) {
                passed = false;
                break;
              }
            }
          }
        }
      }
      assert(passed);
    });

  });
});

suite('Regression Tests', function() {
  // Github Issue #32 reported by AlgoTrader
  test('Issue #32 - castling flag reappearing', function() {
    var chess = new Chess('b3k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qNP/6QK b k - 2 28');
    chess.move({from:'a8', to:'g2'});
    assert(chess.fen() == '4k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qbP/6QK w k - 0 29');
  });

  test('Issue #58 - placing more than one king', function() {
    var chess = new Chess('N3k3/8/8/8/8/8/5b2/4K3 w - - 0 1');
    assert(chess.put({type: 'k', color: 'w'}, 'a1') == false);
    chess.put({type: 'q', color: 'w'}, 'a1');
    chess.remove('a1');
    assert(chess.moves().join(' ') == 'Kd2 Ke2 Kxf2 Kf1 Kd1');
  });
});