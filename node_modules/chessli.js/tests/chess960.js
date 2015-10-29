if (typeof require != "undefined") {
  var chai = require('chai');
  var Chess = require('../chess').Chess;
}
var assert = chai.assert;

suite("Chess960", function() {

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
    {fen: 'bbrqn1kr/p2ppppp/2p1n3/8/p7/2PNN3/PP1PPPPP/BBR3KR w KQkq - 0 5',
      square: 'g1', verbose: false, moves: ['Kf1', 'O-O', 'O-O-O']},
    {fen: 'rb1knr1q/pp1b2pp/2pp1n2/5p2/1PP5/3NPN2/P1B3PP/R1BK1R1Q w KQkq - 0 9',
      square: 'd1', verbose: false, moves: ['Kd2', 'Ke2', 'Ke1', 'O-O']},
    {fen: 'rkr4n/pppbpqbp/3pnpp1/3N4/P3N3/R2P4/1PPBPPPP/1KR2BQ1 b Kkq - 3 8',
      square: 'b8', verbose: false, moves: ['O-O']},
  ];

  positions.forEach(function(position) {
    var chess = new Chess(position.fen, 1);

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

suite("Make Move", function() {

  var positions = [
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
     legal: true,
     move: 'e4',
     next: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'},
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
     captured: 'p'},
    {fen: 'r1kqnnbr/ppbppppp/2p5/8/8/8/8/K7 b kq a3 0 3',
      legal: true,
      move: 'd6',
      next: 'r1kqnnbr/ppb1pppp/2pp4/8/8/8/8/K7 w kq - 0 4'},
    {fen: 'rkr3qn/pppbppbp/3pn1p1/8/P7/R2PN1N1/1PPBPPPP/1KR2BQ1 b Kkq - 3 6',
      legal: true,
      move: 'Qd8',
      next: 'rkrq3n/pppbppbp/3pn1p1/8/P7/R2PN1N1/1PPBPPPP/1KR2BQ1 w Kkq - 4 7'}
  ];

  positions.forEach(function(position) {
    var chess = new Chess(position.fen, 1);
    test(position.fen + ' (' + position.move + ' ' + position.legal + ')', function() {
      var result = chess.move(position.move);
      if (position.legal) {
        console.log(chess.fen());
        assert(result
               && chess.fen() == position.next
               && result.captured == position.captured);
      } else {
        assert(!result);
      }
    });

  });

});
