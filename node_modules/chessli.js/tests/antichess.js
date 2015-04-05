if (typeof require != "undefined") {
  var chai = require('chai');
  var Chess = require('../chess').Chess;
}
var assert = chai.assert;

suite('Antichess Variant Tests', function() {

    test("In antichess, it is possible to take another player's king", function() {
        var position = "8/8/6n1/1P6/3K4/8/8/3k3R w - -";
        var antichess_variant = 2;
        var chess = new Chess(position, antichess_variant);
        chess.move({from:"h1", to: "d1"});
        assert(chess.fen().contains('8/8/6n1/1P6/3K4/8/8/3R4 b - -'));
    });

    test("In antichess, it is possible to promote a pawn to a king", function () {
        var position = "8/1RP5/8/8/8/8/8/6kn w - -";
        var antichess_variant = 2;
        var chess = new Chess(position, antichess_variant);

        var move = {color:'b', from:'c7', to:'c8', flags:'np', piece:'p', promotion:'k', san:'c8=k'};
        chess.move(move);
        var fen = chess.fen();

        console.info(fen);
        assert(fen.contains('2K5/1R6/8/8/8/8/8/6kn b - -'));
    });

    test("In antichess, it is not possible to castle", function() {
        var position = "rnbqk2r/p1ppppbp/5np1/8/8/5NP1/PPPPPPBP/RNBQK2R w KQkq -";
        var antichess_variant = 2;
        var chess = new Chess(position, antichess_variant);

        var legalMoves = chess.moves();

        var passed = true;
        for (var j = 0; j < legalMoves.length; j++) {
            if (legalMoves[0] == "0-0")
            passed = false;
        }
        assert(passed);
    });
});
