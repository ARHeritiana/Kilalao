/* Narration for the guided demos. Each line is one spoken clip, voice/<game>-<n>.ogg.
   Changing a line requires regenerating its clip (scripts/make-voice.py). */
'use strict';
const DEMO_TEXT={
 hanoi:[
  "This is the Tower of Hanoi. The goal is to move the whole tower onto the peg on the right.",
  "Tap a peg to lift its top disk, then tap the peg where it should land. A disk can never sit on a smaller one.",
  "To free a big disk, park the smaller ones on the spare peg first. Watch the pattern unfold.",
  "Keep repeating that idea, and the whole tower follows. Now it's your turn."],
 nim:[
  "Nim is a game for two players. On your turn, take as many counters as you like, but only from one heap.",
  "Tap a counter, and it's taken together with every counter to its right. Then confirm.",
  "Whoever takes the very last counter wins. Pass the phone, and take turns.",
  "Here's the secret. Write each heap in binary, and combine them with exclusive or. If you can leave a total of zero, you're winning."],
 chomp:[
  "Chomp is a chocolate bar with a poisoned square in the top left corner.",
  "Tap a square to bite it, along with every square below it and to its right.",
  "Whoever has to eat the poisoned square loses. The first player can always win, but nobody knows a simple recipe for how."],
 domineering:[
  "In Domineering, two players place dominoes on a grid. Blue always stands them upright. Red always lays them flat.",
  "Just tap the squares your domino should cover.",
  "If you can't place a domino on your turn, you lose. So keep room for yourself, and take it away from your opponent."],
 clobber:[
  "Clobber starts with a full board of blue and red stones.",
  "Tap one of your stones, and the stones you can capture light up. Tap one, and your stone moves there.",
  "Every move must capture. The player who can't capture anything loses."],
 hackenbush:[
  "Hackenbush is a drawing rooted to the ground. Blue may only cut blue edges, and red may only cut red ones.",
  "Tap an edge to cut it. Anything no longer connected to the ground falls away.",
  "The last player able to cut wins. Counting these positions as numbers led to the theory of surreal numbers."],
 sprouts:[
  "Sprouts begins with a few dots. Draw a curve between two dots, or from a dot back to itself.",
  "Just draw with your finger. A new dot sprouts in the middle of every curve.",
  "Curves may never cross, and each dot can hold at most three line ends. When you can't draw, you lose."],
 boxes:[
  "Dots and Boxes. Take turns drawing a single line between two neighbouring dots.",
  "Tap the space between two dots to draw a line.",
  "Complete the fourth side of a box, and it's yours. Then you must draw again.",
  "Near the end, count carefully. Sometimes giving away two boxes wins you all the rest."],
 hex:[
  "Hex is played on a diamond of hexagons. Blue wants to join top and bottom. Red wants to join left and right.",
  "Tap an empty hexagon to claim it.",
  "There are no draws in Hex. Someone always connects, and with perfect play, the first player wins."],
 sim:[
  "Sim has six dots. Players take turns colouring the line between two of them.",
  "Tap two dots to colour the line that joins them.",
  "Avoid making a triangle in your own colour, because whoever does, loses. A draw is impossible."],
 peg:[
  "Peg Solitaire. Jump a peg over its neighbour, into an empty hole, and the jumped peg is removed.",
  "Tap a peg, and the holes it can land in light up. Then tap one.",
  "Keep jumping, and try to finish with just one peg left."],
 lights:[
  "Lights Out. Each tap toggles a light and its four neighbours.",
  "Your goal is to switch every light off.",
  "Order doesn't matter, and pressing a light twice cancels out. That turns this puzzle into algebra."],
 sliding:[
  "The eight puzzle. Put the tiles in order, with the gap in the bottom right corner.",
  "Tap any tile in the same row or column as the gap, and the whole run slides along.",
  "Solve the top row first, then the next, and save the last little square for the end."],
 frogs:[
  "Toads move right, and frogs move left. Your job is to swap the two teams.",
  "Tap a piece to slide it into the gap, or to jump over one piece of the other team.",
  "Alternate the teams as you go, so nobody gets stuck. The best solution takes fifteen moves."],
 sudoku:[
  "Sudoku. Fill the grid so every row, every column and every three by three box holds the digits one to nine.",
  "Tap an empty square. Its row, column and box are shaded to guide you.",
  "Then tap a digit. Look for squares where only one digit can fit, and build from there."],
 nonogram:[
  "A nonogram hides a picture. The numbers give the lengths of the filled runs in each row and column.",
  "This row says five, so every square in it is filled. Tap a square to fill it.",
  "Switch to mark empty, to cross out squares you know are blank."],
 kakuro:[
  "Kakuro is a crossword made of sums. Each row and column must add up to its clue.",
  "A sum of twenty four in three squares can only be seven, eight and nine. Choose a square, then a digit.",
  "Digits never repeat within a row or column. Use the easy clues to unlock the rest."],
 mastermind:[
  "In Mastermind, a secret code of four colours is hidden. Find it in ten guesses or fewer.",
  "Choose a slot, then a colour. The next slot is picked for you. Then check your guess.",
  "Exact means the right colour in the right place. Colour only means it's in the code, but somewhere else."],
 set:[
  "Every card has four features: colour, shape, number, and shading.",
  "Three cards make a set when each feature is either all the same, or all different. Tap three cards to claim them.",
  "Find five sets to win. If you're sure there's none on the table, add three more cards."],
 queens:[
  "Place eight queens so that none of them attack each other. No shared row, column or diagonal.",
  "Tap a square to place a queen. Queens under attack turn red.",
  "Tap a queen again to remove it. Work row by row, and step back when you get stuck."],
 tangram:[
  "Tangram. Seven pieces that fit together into one perfect square.",
  "Drag a piece into the shaded square. Its corners click neatly into place.",
  "Tap a piece that's already selected to turn it, and use flip for the parallelogram."],
 rubik:[
  "Here's the cube. Each face should end up a single colour.",
  "Swipe across a row or a column to turn it.",
  "Drag beside the cube to look around it. The side keys turn whole faces, and hint retraces the scramble, one turn at a time."],
 river:[
  "A farmer must ferry a wolf, a goat and a cabbage across the river. The boat holds the farmer and just one passenger.",
  "Tap a passenger to seat them beside the farmer, then tap the boat to row across.",
  "Never leave the wolf alone with the goat, or the goat alone with the cabbage.",
  "Here's the clever part. Bring the goat back with you. Can you finish from here?"],
 twentyfour:[
  "Make twenty four, using all four numbers exactly once.",
  "Tap the numbers and signs to build your expression.",
  "Then tap make twenty four to check it. There's often more than one way."]
};
if(typeof module!=='undefined')module.exports=DEMO_TEXT;
