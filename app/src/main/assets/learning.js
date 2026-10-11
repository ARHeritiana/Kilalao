const LEARNING = {
  "hanoi": {
    "id": "hanoi",
    "rules": [
      "Begin with a stack of disks on the left peg, with the largest at the bottom. Move the entire stack to the target peg.",
      "Move only the top disk of a peg, one disk at a time. A larger disk may never rest on a smaller one.",
      "The classic puzzle has three pegs. Four-peg Hanoi adds a spare peg but keeps the size rule.",
      "In cyclic Hanoi, moves must follow the directed cycle A → B → C → A. In adjacent-peg Hanoi, moves may only go between neighboring pegs."
    ],
    "strategy": [
      "For three pegs, move the smallest n−1 disks to the spare peg, move the largest disk to the target, then move the n−1 stack onto it.",
      "Compare your move count with 2ⁿ−1 in the classic puzzle. Four disks need 15 moves; five need 31. Extra detours can be undone and studied.",
      "With four pegs, park a small top stack on one spare peg, move the remaining stack using three pegs, then reunite the stacks. Try different split sizes."
    ],
    "research": [
      "The three-peg recurrence is T(n)=2T(n−1)+1, with T(0)=0, giving T(n)=2ⁿ−1. Before the largest disk can move, all smaller disks must be cleared, so the recurrence supplies both a construction and a lower bound.",
      "The Frame–Stewart method splits the stack into two parts when extra pegs are available. Thierry Bousch proved its optimality for four pegs in 2014. That theorem concerns the four-peg problem; it should not be treated as a proof for arbitrary numbers of pegs.",
      "Restricting the legal peg connections turns the puzzle into a shortest-path problem on a different graph. For the three pegs in a line, moving a complete n-disk tower between the two outer pegs requires 3ⁿ−1 moves."
    ],
    "sources": [
      {
        "label": "Université Lyon 1 — Hanoi and recursion",
        "url": "https://math.univ-lyon1.fr/irem/Formation_ISN/formation_recursivite/complexite/hanoi.html"
      },
      {
        "label": "Thierry Bousch — La quatrième tour de Hanoï (2014), publication list",
        "url": "https://www.imo.universite-paris-saclay.fr/~thierry.bousch/preprints/"
      },
      {
        "label": "Bousch — Stockmeyer’s star variant (2017)",
        "url": "https://www.mat.univie.ac.at/~slc/wpapers/s77bousch.html"
      }
    ]
  },
  "nim": {
    "id": "nim",
    "rules": [
      "In normal Nim, two players alternate removing one or more counters from exactly one heap. The player taking the final counter wins.",
      "In misère Nim, the same moves are allowed, but taking the final counter loses.",
      "Related heap games change the moves: a subtraction game permits only specified removal counts; Wythoff permits removal from one heap or equal amounts from both.",
      "Fibonacci Nim limits each removal after the opening to twice the previous removal. Grundy’s Game splits a heap into two unequal nonempty heaps; Kayles removes one pin or two adjacent pins."
    ],
    "strategy": [
      "For normal Nim, compute the bitwise XOR of all heap sizes. If it is nonzero, reduce one heap so that the new XOR is zero. For example, (3,4,5) can become (1,4,5).",
      "In misère Nim, use normal Nim strategy while at least two heaps exceed one. When just one large heap remains, reduce it to zero or one so that an odd number of single counters remains for your opponent.",
      "For a new rule set, start with tiny positions: a position with no move loses; a position with a move to a losing position wins. The XOR of raw heap sizes does not automatically solve other variants."
    ],
    "research": [
      "Charles L. Bouton’s 1901 paper gave Nim a complete mathematical analysis. The losing positions of normal Nim have XOR zero: every legal move breaks that condition, while every nonzero position has a move that restores it.",
      "The Sprague–Grundy theorem extends this idea to finite impartial games under normal play. Each independent component gets a nimber computed from its possible next states, and those nimbers combine by XOR. It is the computed game values, rather than necessarily the heap sizes, that are combined.",
      "Misère play needs separate analysis because the terminal winner changes. Wythoff, Fibonacci Nim, subtraction games, and splitting games have their own structures; grouping them in one learning family does not make their strategies interchangeable."
    ],
    "sources": [
      {
        "label": "Charles L. Bouton — Nim, A Game with a Complete Mathematical Theory (1901), original text",
        "url": "https://en.wikisource.org/wiki/Nim,_A_Game_with_a_Complete_Mathematical_Theory"
      },
      {
        "label": "Academic notes — Impartial combinatorial games and Sprague–Grundy theory",
        "url": "https://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/comb.pdf"
      }
    ]
  },
  "chomp": {
    "id": "chomp",
    "rules": [
      "Two players alternate choosing a remaining square of a chocolate rectangle.",
      "A bite removes the chosen square and every remaining square that lies both at or below its row and at or to the right of its column.",
      "The upper-left square is poisoned. Taking it loses, so the aim is to leave your opponent with only that square.",
      "A board reflected vertically has the equivalent bottom-left poison and upward-right bites."
    ],
    "strategy": [
      "On a square board larger than 1×1, remove the square immediately diagonally down-right from the poison. This leaves equal arms; mirror each later move across the diagonal.",
      "When the board has become an L shape with equal-length arms, reply in the opposite arm at the matching distance from the poisoned square.",
      "For other shapes, inspect the whole remaining boundary and test small continuations. Removing the biggest bite is not a general winning rule."
    ],
    "research": [
      "David Gale’s chocolate formulation is related to Frederik Schuh’s earlier divisor game. For every starting rectangle other than the lone poisoned square, a strategy-stealing argument proves the first player has a winning strategy.",
      "This existence proof does not give a universal opening move. Doron Zeilberger’s 2001 work on three-rowed Chomp illustrates how symbolic methods, recurrences, and computer exploration can help study restricted board shapes.",
      "A small board can be solved recursively by marking a position winning if it has a safe move to a losing position. Mathematical proofs about selected shapes and exhaustive computations answer different questions; neither should be presented as a simple formula for every board."
    ],
    "sources": [
      {
        "label": "Institute of Mathematical Sciences — Game of Chomp",
        "url": "https://www.imsc.res.in/outreach/events/open-day/2025/demos/game-of-chomp/"
      },
      {
        "label": "Doron Zeilberger — Three-Rowed Chomp (2001)",
        "url": "https://sites.math.rutgers.edu/~zeilberg/mamarim/mamarimhtml/chomp.html"
      },
      {
        "label": "David Eppstein’s combinatorial-games archive — Chomp strategy-stealing discussion",
        "url": "https://ics.uci.edu/~eppstein/cgt/chomp.html"
      }
    ]
  },
  "domineering": {
    "id": "domineering",
    "rules": [
      "Two players share an empty square grid and alternate placing a domino over two empty neighboring squares.",
      "One player may place dominoes only vertically; the other may place them only horizontally.",
      "Dominoes cannot overlap previously occupied squares. The first player with no legal placement loses."
    ],
    "strategy": [
      "Look for narrow strips that support your orientation but not your opponent’s. These can become reserve moves for later.",
      "Consider how a placement divides the empty board. Small disconnected regions can be analyzed separately, making the endgame easier to read.",
      "Count useful future placements rather than only empty squares. A move that blocks several opposing placements can be better than one that occupies open central space."
    ],
    "research": [
      "Domineering is a partizan game: the players have different legal moves in the same position. Combinatorial game theory assigns values to small regions and studies how those regions combine; normal Nim’s raw XOR test is not the right general tool here.",
      "Computer projects such as DOMI and the University of Alberta’s Obsequi solved specific board sizes using search, transposition tables, move ordering, symmetry, and bounds. Obsequi’s archived research reports a first-player win on the 10×10 board.",
      "A solved board size is a statement about perfect play from that particular starting board. It does not mean that a simple strategy is known for every rectangle, nor that every later position is easy for a human to evaluate."
    ],
    "sources": [
      {
        "label": "University of Alberta — Obsequi’s Domineering research",
        "url": "https://webdocs.cs.ualberta.ca/~games/domineering/"
      },
      {
        "label": "Nathan Bullock — Domineering: solving large combinatorial search spaces",
        "url": "https://era.library.ualberta.ca/items/3c565809-d1e1-4681-9721-fefb32ebf779"
      }
    ]
  },
  "clobber": {
    "id": "clobber",
    "rules": [
      "Each player owns one color of pieces on a grid, usually starting in an alternating checkerboard pattern.",
      "On your turn, move one of your pieces onto a horizontally or vertically adjacent opponent’s piece, removing the captured piece.",
      "The original square becomes empty. You cannot move into an empty square or capture diagonally.",
      "If you cannot capture on your turn, you lose."
    ],
    "strategy": [
      "Before capturing, count the remaining enemy neighbors of both the moving piece and your other pieces. A tempting capture can leave your army unable to move.",
      "Watch for independent clusters separated by empty cells. Their remaining moves and the order in which you play them determine the endgame.",
      "Trace short forced capture sequences all the way to the player who gets stuck. Capturing more pieces immediately is not itself the winning objective."
    ],
    "research": [
      "Clobber emerged in the early 2000s as a combinatorial game with asymmetric piece ownership and disappearing mobility. Its board shrinks in occupied area after every move, making it suitable for finite game-tree analysis.",
      "Erik Demaine, Martin Demaine, and Rudolf Fleischer studied Solitaire Clobber in 2002. In their single-player version, one controller alternates colors and tries to minimize survivors; they analyzed checkerboard rows and other configurations.",
      "That solitaire optimization problem is different from the two-player contest. A result about how few pieces a cooperative sequence can leave does not supply a guaranteed winning strategy against an opponent."
    ],
    "sources": [
      {
        "label": "Demaine, Demaine & Fleischer — Solitaire Clobber (2002)",
        "url": "https://erikdemaine.org/papers/Clobber_TR2002/"
      },
      {
        "label": "Solitaire Clobber — research paper",
        "url": "https://arxiv.org/abs/cs/0204017"
      }
    ]
  },
  "hackenbush": {
    "id": "hackenbush",
    "rules": [
      "The board is a drawing made of edges connected by paths to a ground line.",
      "In blue-red Hackenbush, one player may cut only blue edges and the other only red edges.",
      "After each cut, erase every part that no longer has a path to the ground. The player with no edge of their color left to cut loses.",
      "In green Hackenbush, either player may cut any edge; it is a different, impartial version."
    ],
    "strategy": [
      "Inspect what hangs above an edge before cutting it. One low cut can remove a large collection of your own and your opponent’s future moves.",
      "For separate green stalks, treat their heights as Nim heaps and seek a zero XOR after your move.",
      "For colored stalks, start by solving small examples backward. Do not carry the green-stalk XOR rule over to blue-red play."
    ],
    "research": [
      "Green Hackenbush provides a visual form of impartial game theory. A rooted stalk with n edges is exactly equivalent to a Nim heap of size n because a cut leaves any smaller height.",
      "For green rooted trees, the colon principle combines branches using their nimbers. For green graphs with cycles, the fusion principle transforms cycles without changing the nimber. These are theorems about game value, not simply about how a picture looks.",
      "Blue-red Hackenbush is a central example in Conway’s theory of partizan games and numbers. Finite colored stalks illustrate dyadic values such as halves and quarters; the green and colored versions require different mathematical analyses."
    ],
    "sources": [
      {
        "label": "Academic notes — Green Hackenbush, colon and fusion principles",
        "url": "https://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/comb.pdf"
      },
      {
        "label": "Andrew Beveridge — Green Hackenbush teaching chapter",
        "url": "https://mathbeveridge.github.io/games/hack-green0.html"
      },
      {
        "label": "Berlekamp — published books, including Winning Ways",
        "url": "https://math.berkeley.edu/~berlek/pubs/books.html"
      }
    ]
  },
  "sprouts": {
    "id": "sprouts",
    "rules": [
      "Begin with a few dots on a drawing surface. Players alternate drawing a curve from one dot to another, or from a dot back to itself.",
      "A curve may not cross or touch an existing curve, and may touch dots only at its endpoints.",
      "Add one new dot somewhere on the new curve. No dot may have more than three incident line ends; a loop uses two at its starting dot.",
      "The first player unable to draw a legal curve loses."
    ],
    "strategy": [
      "Track each dot’s remaining connections: 3 minus its number of incident line ends. A new dot on a curve starts with one connection remaining.",
      "Think about regions, not the length or artistic shape of a curve. Encircling dots can restrict which future connections are possible.",
      "Start with one, two, or three dots and compare complete continuations. Separate independent regions may be evaluated with nimbers under normal play."
    ],
    "research": [
      "John Conway and Michael Paterson invented Sprouts at Cambridge in 1967. Each move consumes a net one available connection, and an n-dot game finishes in at most 3n−1 moves.",
      "Julien Lemoine and Simon Viennot’s 2010 study used nimbers, independent subgames, position simplification, and stored results to extend computer analysis. Their calculations supported a conjectured pattern: first-player wins when the starting dot count is 3, 4, or 5 modulo 6.",
      "The cited paper reports computational evidence for that pattern, not a proof for every starting count. Topological position encoding also matters: curves that look different can represent the same game, while superficially similar drawings may enclose different regions."
    ],
    "sources": [
      {
        "label": "Lemoine & Viennot — Computer analysis of Sprouts with nimbers (2010)",
        "url": "https://arxiv.org/abs/1008.2320"
      },
      {
        "label": "Lemoine & Viennot — Sprouts on compact surfaces (2008)",
        "url": "https://arxiv.org/abs/0812.0081"
      }
    ]
  },
  "boxes": {
    "id": "boxes",
    "rules": [
      "Players alternate drawing one missing horizontal or vertical edge between neighboring dots.",
      "Completing the fourth side of a square claims that box for the player who drew the edge.",
      "Whenever you claim one or more boxes, you must take another turn. Otherwise play passes to your opponent.",
      "When every edge has been drawn, the player with more boxes wins; equal scores are a draw."
    ],
    "strategy": [
      "In the opening, avoid adding the third side of a box when safe alternatives remain. That often gives your opponent an immediate scoring opportunity.",
      "Identify long chains and closed loops before the endgame. Opening one may hand many boxes to the opponent, so compare their lengths.",
      "Learn the double-cross: in suitable long-chain endgames, taking all but two boxes of a chain, or all but four of a loop, can preserve control. Decide whether the sacrificed points are worth control."
    ],
    "research": [
      "Elwyn Berlekamp developed a mathematical theory of Dots and Boxes, presented early results in the late 1960s, and published The Game of Dots and Boxes in 2000. His work explains why control of chains and loops can matter more than immediately taking every available point.",
      "The connection with impartial game theory is subtle. Dots and Boxes is a scoring game with extra turns, so ordinary Sprague–Grundy theory does not apply directly to the whole game. Related positions and the game Nimstring allow powerful endgame techniques.",
      "Research also studies computer search and computational complexity. Complexity results for generalized games do not mean that a small classroom board is impossible to solve, or that an app opponent necessarily plays perfectly."
    ],
    "sources": [
      {
        "label": "Elwyn Berlekamp — Dots-and-Boxes research overview",
        "url": "https://math.berkeley.edu/~berlek/cgt/dots.html"
      },
      {
        "label": "Berlekamp & Scott — Forcing Your Opponent to Stay in Control of a Loony Dots-and-Boxes Endgame",
        "url": "https://library.slmath.org/books/Book42/files/beforcing.pdf"
      },
      {
        "label": "Dots & Boxes is PSPACE-complete (2021)",
        "url": "https://arxiv.org/abs/2105.02837"
      }
    ]
  },
  "hex": {
    "id": "hex",
    "rules": [
      "Players alternate placing a stone of their color on any empty hexagonal cell.",
      "One player aims to connect the top and bottom sides; the other aims to connect the left and right sides.",
      "A winning path is a chain of adjacent stones of one color touching both of that player’s goal sides.",
      "Stones remain in place. Standard Hex has no draws."
    ],
    "strategy": [
      "Build connections rather than isolated stones. A bridge consists of two stones with two possible intermediate connecting cells; either response can often repair an attack on one route.",
      "Try to threaten two useful connections at once. A move with only one continuation is easier for your opponent to block.",
      "Balance extending your own route with cutting the opponent’s. Near an edge, count how many empty cells are still needed to connect securely."
    ],
    "research": [
      "The no-draw property is topological: on a completely occupied board, exactly one color has the required crossing connection. Nash’s strategy-stealing argument proves that the first player has a winning strategy on a square board under the ordinary rules without the swap rule.",
      "The theorem does not provide a practical winning move. University of Alberta research on Wolve and MoHex combined virtual-connection analysis, inferior-cell pruning, search, and Monte Carlo methods to improve play and solve particular small-board cases.",
      "A virtual connection is a promise that a player can complete a link despite local opposition. Computer Hex research studies how such local promises can be combined. The swap rule, when used, changes the opening protocol and should not be confused with the ordinary first-player theorem."
    ],
    "sources": [
      {
        "label": "University of Alberta — Computer Hex Research Group",
        "url": "https://webdocs.cs.ualberta.ca/~hayward/hex/"
      },
      {
        "label": "Ryan Hayward — academic Hex teaching notes",
        "url": "https://webdocs.cs.ualberta.ca/~hayward/396/jem/hex.html"
      }
    ]
  },
  "sim": {
    "id": "sim",
    "rules": [
      "The board has six vertices, with a possible edge between every pair: 15 edges in total.",
      "Players alternate choosing one uncolored edge and coloring it with their own color.",
      "If your new edge completes a triangle whose three edges are your color, you immediately lose.",
      "Crossings between drawn edges do not create extra vertices. Only the six original vertices count."
    ],
    "strategy": [
      "Before choosing an edge, check whether its endpoints already share a neighbor connected to both in your color. If they do, that move completes your triangle and loses.",
      "Count your safe remaining edges and your opponent’s safe edges. Aim to limit their options while preserving your own.",
      "Use symmetry when exploring continuations: rotating the drawing or relabeling the vertices does not change the game if the colored-edge pattern is preserved."
    ],
    "research": [
      "Gustavus Simmons introduced Sim in 1969. Ramsey’s theorem R(3,3)=6 guarantees that a complete two-coloring of the edges on six vertices contains a monochromatic triangle, so a legal game cannot end with a fully colored, triangle-free board.",
      "That Ramsey theorem guarantees an eventual loser but does not identify the winning player. The standard six-vertex game has a second-player winning strategy under perfect play, though it is far less convenient to memorize than Nim’s XOR rule.",
      "Wolfgang Slany’s 1999 paper studies a broader family of graph Ramsey games and proves PSPACE-completeness for unrestricted versions. This is a result about growing generalized instances, not about the difficulty class of one fixed 15-edge board."
    ],
    "sources": [
      {
        "label": "Wolfgang Slany — Graph Ramsey games (1999)",
        "url": "https://arxiv.org/abs/cs/9911004"
      },
      {
        "label": "Simon Fraser University — Sim and Ramsey theory project",
        "url": "https://www.sfu.ca/~vjungic/RamseyProjects/sec_Pr_24.html"
      }
    ]
  },
  "peg": {
    "id": "peg",
    "rules": [
      "A peg jumps over an adjacent peg into an empty hole two steps away along a permitted straight line.",
      "Remove the jumped peg. On the English cross board, jumps are horizontal or vertical; triangular boards use their three grid directions.",
      "The usual goal is to finish with exactly one peg. Some challenges require that survivor to occupy a specified hole.",
      "Having no legal jump is not a win unless the required final position has been reached."
    ],
    "strategy": [
      "Work backward from your desired final jump. It tells you which two pegs and which empty landing hole must exist just before the finish.",
      "Avoid leaving an isolated peg with no possible future partner. Keep a route for clearing corners and outer arms.",
      "Clear regions in coordinated patterns rather than taking arbitrary available jumps. Use undo to study why a move produced a dead end."
    ],
    "research": [
      "Peg Solitaire is a reachability problem: which final configurations can be reached from a given start? Position-class invariants and weighted-board arguments can rule out some goals without exploring every jump.",
      "George Bell’s 2009 study represents boards using bits and reduces search using symmetry. It also constructs databases of winning positions so a computer can distinguish a good jump from a move into a dead end.",
      "A necessary invariant is not always a sufficient solution test. Passing a parity check does not guarantee a sequence exists. Likewise, the minimum number of jumps and the minimum number of moves are different objectives when one move may contain several consecutive jumps by the same peg."
    ],
    "sources": [
      {
        "label": "George Bell — Notes on solving and playing peg solitaire on a computer (2009)",
        "url": "https://arxiv.org/abs/0903.3696"
      },
      {
        "label": "George Bell — research papers and board analyses",
        "url": "https://gibell.net/pegsolitaire/"
      }
    ]
  },
  "lights": {
    "id": "lights",
    "rules": [
      "Each cell contains a light that is either on or off. Your goal is to turn every light off.",
      "Pressing a cell toggles that light and its existing horizontal and vertical neighbors.",
      "Toggling means on becomes off and off becomes on. Diagonal neighbors are unchanged.",
      "The standard board has no wraparound: edge cells affect fewer neighbors."
    ],
    "strategy": [
      "Pressing the same cell twice cancels out, and press order does not matter. Track which cells you press rather than searching through every ordering.",
      "Chase lights downward: for each lit cell in the first row, press directly below it, then repeat row by row. This clears all but the last row.",
      "If the bottom row remains lit, change your first-row press pattern and chase again. A solver can use binary linear equations to find a successful pattern rather than guess."
    ],
    "research": [
      "Lights Out is linear algebra over the two-element field: represent each press by 0 or 1, each light state by 0 or 1, and solve Ax=b modulo 2. Each column of A records which lights one button toggles.",
      "Marlow Anderson and Todd Feil’s 1998 paper explains the standard 5×5 puzzle through this framework. Some starting states are unsolvable; whenever a solution exists, adding a pattern from the matrix’s kernel produces another solution.",
      "Research extends the game to arbitrary graphs, different board boundaries, and multiple light states. Matrix rank controls which states are reachable. Finding a solution and finding a solution with the fewest presses are distinct tasks."
    ],
    "sources": [
      {
        "label": "Anderson & Feil — Turning Lights Out with Linear Algebra (1998)",
        "url": "https://www.tandfonline.com/doi/abs/10.1080/0025570X.1998.11996658"
      },
      {
        "label": "Andries Brouwer — Lights Out on rectangles, mathematics and references",
        "url": "https://aeb.win.tue.nl/ca/madness/madrect.html"
      },
      {
        "label": "J. Jacob Tawney — Turning the Lights Out in Three Dimensions",
        "url": "https://scholar.rose-hulman.edu/rhumj/vol1/iss1/2/"
      }
    ]
  },
  "sliding": {
    "id": "sliding",
    "rules": [
      "In the numbered sliding puzzle, slide a tile horizontally or vertically into the single empty square.",
      "Restore the tiles to ascending row order, with the empty square at the end.",
      "Traffic puzzles in this family use a different rule: rectangular vehicles slide only along their own length, and the target vehicle must reach an exit.",
      "Rush Hour is a commercial puzzle; this app's numbered slider is an independent educational recreation of the sliding-puzzle family."
    ],
    "strategy": [
      "For numbered tiles, finish the top row and left column gradually, leaving a smaller unfinished rectangle.",
      "Think about where the empty square must be before moving a tile; cycling several tiles is often better than undoing one move.",
      "For traffic puzzles, work backward from the exit: list its blockers, then the blockers preventing those pieces from moving."
    ],
    "research": [
      "Numbered sliding puzzles connect to permutations and parity. Half of the possible arrangements cannot reach a fixed solved arrangement. For even-width boards such as the 15 Puzzle, the test includes both inversion parity and the empty square's row; counting inversions alone is insufficient.",
      "A* search finds shortest routes using a lower bound such as Manhattan distance: the sum of each tile's horizontal and vertical distance from its goal. Sliding-block researchers also proved PSPACE-completeness for generalized Rush Hour and related puzzles. This concerns families whose boards can grow, rather than a claim that every small puzzle is difficult."
    ],
    "sources": [
      {
        "label": "Princeton: sliding-puzzle parity and A* search",
        "url": "https://www.cs.princeton.edu/courses/archive/spring20/cos226/assignments/8puzzle/specification.php"
      },
      {
        "label": "Hearn & Demaine: sliding-block complexity",
        "url": "https://erikdemaine.org/papers/NCL_TCS/"
      }
    ]
  },
  "frogs": {
    "id": "frogs",
    "rules": [
      "A row starts with one group facing right, one empty square, and another group facing left.",
      "A piece may move forward into an adjacent empty square or jump forward over one opposing piece into an empty square.",
      "Pieces cannot move backward or jump over their own group.",
      "Swap the two groups, keeping the empty square between them in the final arrangement."
    ],
    "strategy": [
      "Try the one-pair and two-pair boards first, and record the pattern of slides and jumps.",
      "Prefer moves that allow pieces of opposite groups to pass without trapping the empty square at a blocked end.",
      "If stuck, undo to the most recent slide and try the other side; slides often determine the next run of jumps."
    ],
    "research": [
      "With m pieces on one side and n on the other, a successful standard swap uses mn jumps and m+n slides, for mn+m+n moves. Every opposite pair must pass once, accounting for the jumps; total forward distance accounts for the remaining slides. With three pieces on each side, the target is 15 moves.",
      "The solo swapping puzzle is different from the two-player game also called Toads and Frogs. The puzzle is useful for studying state graphs and counting arguments; the two-player version assigns one species to each player and is studied in combinatorial game theory."
    ],
    "sources": [
      {
        "label": "The Mathematica Journal: Buckets and Jumping Pets",
        "url": "https://www.mathematica-journal.com/2009/01/12/buckets-and-jumping-pets/"
      },
      {
        "label": "University of Cambridge NRICH: Frogs",
        "url": "https://nrich.maths.org/solving-together-frogs"
      }
    ]
  },
  "sudoku": {
    "id": "sudoku",
    "rules": [
      "Fill every empty square with one permitted digit.",
      "Each row, each column, and each outlined box must contain every permitted digit exactly once.",
      "The starting clues are fixed and cannot be edited.",
      "Standard Sudoku uses digits 1–9 and nine 3×3 boxes; a mini board uses a smaller digit set and correspondingly smaller boxes."
    ],
    "strategy": [
      "Look for a square with only one candidate: eliminate digits already present in its row, column, and box.",
      "Also look for a digit that has only one possible square within a row, column, or box.",
      "If two squares in one unit have exactly the same two candidates, remove those candidates from the other squares of that unit."
    ],
    "research": [
      "Sudoku is a constraint-satisfaction problem: each square is a variable, and rows, columns, and boxes impose all-different constraints. Computer solvers use approaches including backtracking and exact-cover search, while human methods aim to explain candidate eliminations.",
      "Gary McGuire, Bastian Tugemann, and Gilles Civario used exhaustive computation and hitting-set methods to prove that no standard 9×9 Sudoku with 16 clues has a unique solution. Thus 17 is the minimum possible clue count for that precise format. This result does not apply to mini Sudoku or imply that every 17-clue puzzle is valid or uniquely solvable."
    ],
    "sources": [
      {
        "label": "McGuire, Tugemann & Civario: no 16-clue Sudoku",
        "url": "https://arxiv.org/abs/1201.0749"
      },
      {
        "label": "Chi & Lange: Techniques for Solving Sudoku Puzzles",
        "url": "https://arxiv.org/abs/1203.2295"
      }
    ]
  },
  "nonogram": {
    "id": "nonogram",
    "rules": [
      "Fill selected squares and mark the others empty to satisfy every row and column clue.",
      "A clue lists the lengths of consecutive filled runs, in order.",
      "Separate neighboring runs by at least one empty square.",
      "For example, 2 1 means a run of two filled squares followed later by a single filled square."
    ],
    "strategy": [
      "Place each run as far left and as far right as possible; squares occupied in every legal placement must be filled.",
      "Mark an empty square immediately beyond a run once its full length is known.",
      "Alternate rows and columns: each new filled or empty square restricts the crossing line."
    ],
    "research": [
      "K. Joost Batenburg and Walter Kosters studied Nonogram-solving algorithms, difficulty measures, and puzzle construction. Their work uses dynamic programming to reason about one line and combines constraints from multiple lines through logical models such as 2-SAT.",
      "General Nonograms are NP-hard, but many published puzzles are deliberately chosen so that repeated single-line deductions suffice. A unique solution and an easy deduction sequence are different properties; the clues of an arbitrary pixel picture can also permit multiple solutions."
    ],
    "sources": [
      {
        "label": "Batenburg & Kosters: On the Difficulty of Nonograms",
        "url": "https://liacs.leidenuniv.nl/~kosterswa/nonodec2012.pdf"
      },
      {
        "label": "Batenburg & Kosters: combining relaxations",
        "url": "https://www.sciencedirect.com/science/article/pii/S0031320308005153"
      }
    ]
  },
  "kakuro": {
    "id": "kakuro",
    "rules": [
      "Fill white squares with digits 1–9.",
      "The sum clue for each horizontal or vertical run gives its required total.",
      "A digit may not repeat within a single run.",
      "Crossing squares must satisfy both their horizontal and vertical sums."
    ],
    "strategy": [
      "Start with short runs and extreme sums: a two-square total of 3 forces the digits 1 and 2.",
      "List possible digit combinations for each run, then intersect the possibilities at crossings.",
      "Subtract confirmed digits from a run's target; remember that repeated digits remain forbidden."
    ],
    "research": [
      "Kakuro combines arithmetic with all-different constraints. A solver can model each square as a finite-domain variable, then propagate both run sums and digit uniqueness; a correct sum alone is not sufficient.",
      "Oliver Ruepp and Markus Holzer studied the computational complexity of Kakuro and gave an NP-completeness result for its puzzle family. Such results describe worst-case instances as puzzle size grows. They do not say that a small, carefully designed teaching puzzle requires guessing or is beyond an efficient solver."
    ],
    "sources": [
      {
        "label": "Nikoli: Kakuro rules",
        "url": "https://www.nikoli.co.jp/en/puzzles/kakuro/"
      },
      {
        "label": "Ruepp & Holzer: Kakuro complexity paper",
        "url": "https://link.springer.com/chapter/10.1007/978-3-642-13122-6_31"
      }
    ]
  },
  "mastermind": {
    "id": "mastermind",
    "rules": [
      "Discover a hidden sequence by submitting guesses of the same length.",
      "Feedback counts symbols that are correct and in the correct position, plus correct symbols in different positions.",
      "Feedback does not identify which individual guessed positions received which match.",
      "Repeated symbols are allowed in the classic game; each occurrence can contribute to at most one match."
    ],
    "strategy": [
      "Keep only secret codes that would give exactly the feedback observed for every previous guess.",
      "Choose guesses that separate the remaining candidates into several small groups, rather than only chasing likely codes.",
      "Track repeated symbols carefully: two copies in a guess do not both match a single copy in the secret."
    ],
    "research": [
      "Donald Knuth showed that the classic four-position, six-symbol game with repetition can always be solved in at most five guesses. His method minimizes the largest possible group of candidates remaining after the next feedback, starting with a guess of the form AABB.",
      "Research on generalized Mastermind studies query complexity: how many questions are needed as code length and alphabet size grow. A five-guess guarantee depends on the classic parameters and a particular strategy; it is not a promise for arbitrary variants or ordinary human play."
    ],
    "sources": [
      {
        "label": "KTH: Knuth's solution tree and classic rules",
        "url": "https://www.csc.kth.se/~weinkauf/notes/mastermind.html"
      },
      {
        "label": "Cambridge: Mastermind with a linear number of queries",
        "url": "https://www.cambridge.org/core/journals/combinatorics-probability-and-computing/article/mastermind-with-a-linear-number-of-queries/3BCAC12ED935616D36871C12E10A2288"
      }
    ]
  },
  "set": {
    "id": "set",
    "rules": [
      "Find three cards for which each feature is either identical on all three cards or different on all three cards.",
      "Check the features separately: a trio may share one feature while differing in another.",
      "A feature appearing on exactly two of the three cards invalidates the trio.",
      "Classic SET has four features with three values each; this app uses an independent educational presentation of the matching rule."
    ],
    "strategy": [
      "Pick two cards and determine the exact third card needed: shared feature values must remain shared, and differing values require the missing third value.",
      "Search a group of cards sharing one feature first; this reduces the number of features you need to check.",
      "Validate every feature before selecting the trio; a visually attractive pattern can still fail one condition."
    ],
    "research": [
      "Encoding each feature as 0, 1, or 2 turns a classic card into a vector over the field with three elements. Three distinct cards form a set exactly when their vectors sum to zero coordinate by coordinate. This explains why any pair determines one required third card.",
      "The cap-set problem asks how large a collection of vectors can be while containing no such triple. Jordan Ellenberg and Dion Gijswijt established powerful upper bounds using polynomial methods. This is a higher-dimensional generalization of the card-game structure, rather than an algorithm guaranteeing that every small deal contains a set."
    ],
    "sources": [
      {
        "label": "SET publisher: mathematics workbook",
        "url": "https://www.setgame.com/sites/default/files/teacherscorner/mathworkbook_0.pdf"
      },
      {
        "label": "Ellenberg & Gijswijt: cap-set paper",
        "url": "https://annals.math.princeton.edu/2017/185-1/p08"
      }
    ]
  },
  "queens": {
    "id": "queens",
    "rules": [
      "Place n queens on an n×n chessboard.",
      "No two queens may share a row, column, or diagonal.",
      "A completed placement therefore has exactly one queen in each row and each column.",
      "Remove or relocate a queen whenever a conflict prevents further placement."
    ],
    "strategy": [
      "Place one queen per row and record which columns and diagonals are already attacked.",
      "If the next row has no safe square, backtrack to the previous row and try another column.",
      "Use reflections and rotations to recognize equivalent solutions and avoid repeating the same search pattern."
    ],
    "research": [
      "N-Queens is a classic example for teaching backtracking, symmetry reduction, and constraint programming. Diagonal conflicts are easy to encode: squares on the same diagonal have equal row-minus-column or equal row-plus-column values.",
      "Gent, Jefferson, and Nightingale proved that the completion problem is NP-complete and its counting version is #P-complete: some queens are fixed in advance and the remaining placement must extend them. This differs from simply finding one placement on an empty board; do not infer that the empty-board problem has the same hardness result."
    ],
    "sources": [
      {
        "label": "Gent, Jefferson & Nightingale: N-Queens Completion",
        "url": "https://doi.org/10.1613/jair.5512"
      },
      {
        "label": "University of St Andrews: research explanation",
        "url": "https://blogs.cs.st-andrews.ac.uk/csblog/2017/08/31/n-queens-completion-is-np-complete/"
      }
    ]
  },
  "tangram": {
    "id": "tangram",
    "rules": [
      "Build a target silhouette using all seven tangram pieces.",
      "Pieces may touch but may not overlap, and the target must be covered without gaps.",
      "Translate and rotate pieces to fit the outline; the parallelogram may need flipping.",
      "The set contains two large triangles, one medium triangle, two small triangles, a square, and a parallelogram."
    ],
    "strategy": [
      "Place the largest pieces first, matching long straight edges and large triangular regions.",
      "Look for 45°, 90°, and 135° boundary angles to identify promising piece orientations.",
      "Use area as a check: the pieces have fixed areas, so a remaining region must match the area of the unused pieces."
    ],
    "research": [
      "Tangram is a dissection puzzle: a fixed set of polygons is rearranged to create new shapes with the same total area. It gives concrete examples of congruence, reflection, rotation, and the difference between area and perimeter.",
      "Wang and Hsiung's 1942 theorem classified the convex polygons obtainable using the seven standard pieces: there are exactly 13 up to congruence. Convex means that the segment between any two points of the shape stays inside it. Later work has studied further polygon classes, including tangram pentagons; the 13-shape result does not count arbitrary nonconvex silhouettes."
    ],
    "sources": [
      {
        "label": "Wang & Hsiung: A Theorem on the Tangram",
        "url": "https://homepages.gac.edu/~jsiehler/306090/Bibliography/02-wang-hsiung-theorem-on-the-tangram.pdf"
      },
      {
        "label": "Research: characterization of tangram pentagons",
        "url": "https://link.springer.com/article/10.1007/s13366-020-00528-1"
      },
      {
        "label": "University of Cambridge NRICH: Tangram",
        "url": "https://nrich.maths.org/tangram"
      }
    ]
  },
  "rubik": {
    "id": "rubik",
    "rules": [
      "Rotate layers of the cube to restore each face to a single color.",
      "Moves carry whole pieces between positions; stickers are not independent squares.",
      "On a standard 3×3 cube, center colors identify the solved face colors.",
      "The app is an independent educational twisty-cube recreation; Rubik's Cube is a commercial product name."
    ],
    "strategy": [
      "Learn a layer-by-layer method and practice one stage at a time rather than trying to complete isolated faces.",
      "On a 3×3, build a cross that also matches the neighboring center colors, then place its corners.",
      "Learn short move sequences that change selected pieces while restoring the rest, and always track their inverses."
    ],
    "research": [
      "Cube moves form a mathematical group: move sequences compose, each has an inverse, and sequences generally do not commute. Commutators and conjugates help explain how solvers construct sequences that affect only selected pieces.",
      "Rokicki, Kociemba, Davidson, and Dethridge proved in 2010 that every legally reachable standard 3×3 position can be solved in at most 20 face turns, and some need all 20. A 180° face rotation counts as one move in this half-turn metric. The proof used large computations with symmetry and group cosets; its number is specific to the 3×3 and this move-counting rule."
    ],
    "sources": [
      {
        "label": "The researchers: God's Number is 20",
        "url": "https://www.cube20.org/"
      },
      {
        "label": "Rubik's official 3×3 solve guide",
        "url": "https://rubiks.com/solve-guide"
      }
    ]
  },
  "river": {
    "id": "river",
    "rules": [
      "Transport the farmer, wolf, goat, and cabbage from the left bank to the right bank.",
      "The farmer pilots the boat, which carries at most one other passenger or item.",
      "Without the farmer, the wolf cannot be left with the goat, and the goat cannot be left with the cabbage.",
      "The farmer may cross alone; every departure must leave both banks safe."
    ],
    "strategy": [
      "Begin by moving the goat: leaving either other pair behind would be unsafe.",
      "Accept temporary backward progress; bringing the goat back creates a safe next crossing.",
      "Represent each arrangement by the bank occupied by every item and the farmer, then avoid revisiting the same arrangement."
    ],
    "research": [
      "A river-crossing puzzle is a graph-search problem. Safe arrangements are vertices and legal crossings are edges. Breadth-first search finds a route with the fewest crossings when every crossing has equal cost; the classic wolf-goat-cabbage puzzle needs seven crossings.",
      "Researchers have also examined larger crossing families using symmetry, algebra, and category theory. Different capacities and safety constraints define different state graphs, so a successful sequence from one version need not transfer to another."
    ],
    "sources": [
      {
        "label": "Julia Robinson Mathematics Festival: River Crossings",
        "url": "https://jrmf.org/puzzle/river-crossings/"
      },
      {
        "label": "Research: River Crossing Problems, Algebraic Approach",
        "url": "https://arxiv.org/abs/1802.09369"
      }
    ]
  },
  "twentyfour": {
    "id": "twentyfour",
    "rules": [
      "Build an expression equal to exactly 24 from the four displayed numbers.",
      "Use each displayed number exactly once, including separate occurrences of repeated values.",
      "Use addition, subtraction, multiplication, division, and parentheses.",
      "Do not concatenate numbers, use powers or factorials, or divide by zero.",
      "This app is an independent arithmetic puzzle inspired by the make-24 family, rather than an official 24 Game product."
    ],
    "strategy": [
      "Look first for factors of 24: try building 3×8, 4×6, 2×12, or 1×24 from two smaller expressions.",
      "Try useful nearby values such as 25−1 or 18+6; subtraction can correct an almost-right product.",
      "Do not restrict intermediate values to positive integers: fractions can unlock solutions that whole-number attempts miss."
    ],
    "research": [
      "The puzzle illustrates expression-tree search. A complete solver repeatedly combines a pair of available values with an allowed operation until one value remains. It must consider both orders of subtraction and division, and fractions should be tracked exactly to prevent rounding errors.",
      "Enumerative investigations compare how often different targets are achievable under a fixed set of input numbers and allowed operations. Such solvability rates depend on whether repeated numbers, fractions, and extra operations are permitted. An arbitrary four-number hand is not guaranteed to have a solution under these rules."
    ],
    "sources": [
      {
        "label": "24 Game publisher: tournament handbook",
        "url": "https://www.24game.com/pages/tournament-handbook"
      },
      {
        "label": "Rodrigo Girão Serrão: Studying the 24 Game",
        "url": "https://mathspp.com/blog/24-game"
      }
    ]
  }
};
LEARNING.nim.variants = {
  "Wythoff": {
    "rules": [
      "Play with two heaps. Remove any positive number of counters from one heap, or the same positive number from both heaps.",
      "The player who removes the final counter wins."
    ],
    "strategy": [
      "Seek a losing pair for your opponent: (0,0), (1,2), (3,5), (4,7), (6,10), (8,13), and (9,15) are the first examples; reversing the heaps changes nothing.",
      "For a general pair, the losing positions are (⌊kφ⌋, ⌊kφ²⌋), where k≥0 and φ=(1+√5)/2. From any other position, a legal move reaches one of these pairs.",
      "Check both kinds of moves. Equal heap sizes are especially easy: removing both entire heaps is an immediate win."
    ],
    "research": [
      "Wythoff’s game has a complete normal-play solution through two complementary Beatty sequences generated by φ and φ². The irrational golden ratio appears in the strategy even though the rules use only whole-number counters.",
      "Researchers have investigated many-heap generalizations. Sun and Zeilberger’s paper reviews the solved two-heap formula before treating a different generalized game; its generalized conjectures should not be confused with the classical two-heap solution."
    ],
    "sources": [
      {
        "label": "Sun & Zeilberger — On Fraenkel’s N-Heap Wythoff’s Conjecture",
        "url": "https://sites.math.rutgers.edu/~zeilberg/mamarim/mamarimPDF/wythoff.pdf"
      }
    ]
  },
  "Fibonacci Nim": {
    "rules": [
      "Start with one heap. The first player must take at least one counter but cannot take the entire heap.",
      "After that, a move may remove at most twice as many counters as the previous player removed, and never more than remain.",
      "Taking the final counter wins."
    ],
    "strategy": [
      "Write the remaining count as a sum of distinct, nonconsecutive Fibonacci numbers using 1,2,3,5,8,13,… . Find this Zeckendorf representation greedily by repeatedly taking the largest Fibonacci number that fits.",
      "If the smallest summand is within your current removal limit, taking it is a winning move under perfect play. For example, 17=13+3+1, so taking 1 is winning when allowed.",
      "The opening position is losing exactly when its heap size is a Fibonacci number. Later, the removal limit is part of the position: the heap count alone does not determine whether you can win."
    ],
    "research": [
      "The winning criterion ties the game to Zeckendorf’s unique representation theorem. If z is the smallest summand and r is the current removal limit, a nonempty position is losing exactly when r<z.",
      "Larsson and Rubinstein-Salzedo’s research goes beyond winning versus losing to classify several small Grundy values and study their growth. A full game value contains more information than simply whether one winning move exists."
    ],
    "sources": [
      {
        "label": "Larsson & Rubinstein-Salzedo — Grundy values of Fibonacci nim",
        "url": "https://arxiv.org/abs/1410.0332"
      },
      {
        "label": "Ponomarenko — Winning Moves in Fibonacci Nim, research presentation",
        "url": "https://vadim.sdsu.edu/fnim.pdf"
      }
    ]
  },
  "Subtraction": {
    "rules": [
      "Start with one heap. On each turn remove exactly 1, 3, or 4 counters, provided enough remain.",
      "Taking the last counter wins; a player with no legal move loses."
    ],
    "strategy": [
      "For this exact move set, leave a heap whose size is 0 or 2 modulo 7. These are the losing positions for the next player.",
      "A remaining count of 10 leaves remainder 3 on division by 7: take 1 to leave 9, a losing count. From 11, take 4 to leave 7.",
      "If the allowed removals change, rebuild the table. The remainder rule for {1,3,4} is not the rule for {1,2,3}, which instead favors multiples of 4."
    ],
    "research": [
      "Finite subtraction games have eventually periodic Grundy sequences: a bounded window of earlier values determines each next value, so eventually a window repeats. The cited survey discusses this family and research into how long its periods can be.",
      "For {1,3,4}, the recurrence g(n)=mex{g(n−1),g(n−3),g(n−4)}, omitting negative indices, produces the repeating block 0,1,0,1,2,3,2 from n=0. This yields the remainder-7 rule above. Here mex means the smallest nonnegative integer absent from the listed values."
    ],
    "sources": [
      {
        "label": "Ben Lynn, Stanford — Subtraction games and their periodicity",
        "url": "https://theory.stanford.edu/~blynn/play/summer.html"
      },
      {
        "label": "Larsson & Saha — A brief conversation about subtraction games",
        "url": "https://arxiv.org/abs/2405.20054"
      }
    ]
  },
  "Kayles": {
    "rules": [
      "Begin with a row of pins. Remove either one pin or two pins adjacent in the original row.",
      "Gaps stay empty and separate the remaining pins into independent runs; pins on opposite sides of a gap are not adjacent.",
      "The player making the last removal wins."
    ],
    "strategy": [
      "From a single unbroken row, remove the central pin when its length is odd, or the central two pins when it is even. This leaves two identical runs.",
      "Then mirror each opposing move in the other run. The runs are separate, so the matching reply remains legal and you make the last move.",
      "For several unequal runs, compute each run’s Kayles nimber and XOR those values. XOR of the run lengths themselves is not the right test."
    ],
    "research": [
      "Kayles is a classic take-and-break game: removing pins can divide one component into two. Its nimbers are computed by considering all resulting pairs of shorter runs and taking the mex of their XOR values.",
      "Guy and Smith analyzed normal-play Kayles; the single-run nimber sequence is periodic with period 12 from length 71 onward. Conway’s article explains this result. This concerns ordinary Kayles, not Node-Kayles or Dawson’s Kayles, whose move rules differ."
    ],
    "sources": [
      {
        "label": "John Conway — All Games Bright and Beautiful, Kayles discussion",
        "url": "https://maths.dur.ac.uk/users/herbert.gangl/LIT/all_games.pdf"
      },
      {
        "label": "Ben Lynn, Stanford — Kayles recurrence and nimbers",
        "url": "https://theory.stanford.edu/~blynn/play/summer.html"
      }
    ]
  },
  "Grundy": {
    "rules": [
      "On a turn, split exactly one heap into two nonempty heaps of unequal sizes. No counters are removed.",
      "Heaps of size 1 or 2 cannot be split legally. The first player with no legal split loses."
    ],
    "strategy": [
      "Learn small cases: a heap of 3 has the single split 1+2 and is winning; a heap of 4 only splits as 1+3 and is losing.",
      "Evaluate a split using the XOR of its two resulting Grundy values. For example, 8→1+7 is winning because both resulting heaps have value zero.",
      "For multiple heaps, XOR their game values, not their sizes. Seek a split that makes the combined value zero."
    ],
    "research": [
      "Despite its name, Grundy’s Game is one particular unequal-splitting game, while a Grundy value is a general tool for impartial games. The recurrence is g(n)=mex{g(a) XOR g(n−a): 1≤a<n−a}, with g(1)=g(2)=0.",
      "Conway’s historical article reports large computations of the sequence and discusses structural patterns. Finite computation provides exact answers for the sizes examined, but seeing many terms does not by itself prove a general periodicity claim."
    ],
    "sources": [
      {
        "label": "John Conway — All Games Bright and Beautiful, Grundy’s Game discussion",
        "url": "https://maths.dur.ac.uk/users/herbert.gangl/LIT/all_games.pdf"
      },
      {
        "label": "Academic notes — Grundy’s Game exercises and Sprague–Grundy theory",
        "url": "https://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/comb.pdf"
      }
    ]
  }
};
if(typeof module!=="undefined")module.exports=LEARNING;
