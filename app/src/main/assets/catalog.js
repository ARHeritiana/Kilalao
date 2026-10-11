/* One entry per family; variants stay inside their family. */
const CATALOG = [
['hanoi','Tower of Hanoi','Patterns','Solo','A small stack. A wonderfully recursive journey.','Recursion','hanoi'],
['nim','Nim & heap games','Strategy','2 players','Find the hidden pattern in a handful of stones.','Game theory','stones'],
['chomp','Chomp','Strategy','2 players','Take a bite. Leave the poisoned corner behind.','Partial orders','chomp'],
['domineering','Domineering','Strategy','2 players','Vertical versus horizontal. Every square matters.','Geometry','domino'],
['clobber','Clobber','Strategy','2 players','Capture your way through a shrinking board.','Connectivity','checkers'],
['hackenbush','Hackenbush','Strategy','2 players','Cut a branch and watch the landscape change.','Surreal numbers','tree'],
['sprouts','Sprouts','Strategy','2 players','Grow a network with a pencil and a few dots.','Topology','sprouts'],
['boxes','Dots & Boxes','Strategy','2 players','Little squares. Big decisions.','Parity','boxes'],
['hex','Hex','Strategy','2 players','Build a bridge from one edge to the other.','Topology','hex'],
['sim','Sim','Strategy','2 players','The triangle you must never finish.','Ramsey theory','sim'],
['peg','Peg Solitaire','Spatial','Solo','One final peg is all you need.','Invariants','peg'],
['lights','Lights Out','Patterns','Solo','One touch changes more than you think.','Linear algebra','lights'],
['sliding','Sliding Puzzles','Spatial','Solo','Make room for the next move.','Permutations','sliding'],
['frogs','Toads & Frogs','Spatial','Solo','Two little teams. One narrow crossing.','Planning','frogs'],
['sudoku','Sudoku','Logic','Solo','Let each number find its only possible home.','Constraints','sudoku'],
['nonogram','Nonograms','Logic','Solo','Uncover a picture, one deduction at a time.','Deduction','nonogram'],
['kakuro','Kakuro','Numbers','Solo','A crossword where the clues add up.','Combinations','kakuro'],
['mastermind','Mastermind','Logic','2 players / solo','Ask better questions. Crack the secret code.','Information','mastermind'],
['set','SET','Patterns','Solo / group','Spot the pattern hiding in plain sight.','Finite geometry','set'],
['queens','N-Queens','Logic','Solo','Give every queen her own space.','Combinatorics','queens'],
['tangram','Tangram','Spatial','Solo','Seven pieces. A world of possibilities.','Geometry','tangram'],
['rubik','Rubik’s Cube','Spatial','Solo','Bring order to a colorful little universe.','Group theory','rubik'],
['river','River Crossing','Logic','Solo','A boat, a few passengers, and a tricky set of rules.','Graph search','river'],
['twentyfour','The 24 Game','Numbers','Solo / group','Four numbers. One target. Your imagination.','Arithmetic','numbers']
].map((x,i)=>({id:x[0],name:x[1],category:x[2],players:x[3],desc:x[4],math:x[5],art:x[6],number:i+1}));
if(typeof module!=='undefined')module.exports=CATALOG;
