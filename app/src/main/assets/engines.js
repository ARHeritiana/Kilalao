/* Pure game rules. No DOM, network, or Android dependencies. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const last=a=>a[a.length-1];
const range=n=>Array.from({length:n},(_,i)=>i);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function rng(seed){let x=seed|0||1234567;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const MODES={hanoi:['Classic','Four pegs','Cyclic','Adjacent'],nim:['Normal Nim','Misère Nim','Wythoff','Fibonacci Nim','Subtraction','Kayles','Grundy'],sliding:['8 Puzzle','15 Puzzle','Traffic','Klotski'],peg:['Triangle','English'],rubik:['3×3','2×2'],river:['Farmer','Missionaries'],queens:['8 queens','5 queens']};
function init(id,mode,seed=Date.now()){
 let s={id,mode:mode||(MODES[id]||['Standard'])[0],moves:0,player:1,won:false,seed},r=rng(seed);
 switch(id){
 case'hanoi':s.n=4;s.stacks=range(s.mode==='Four pegs'?4:3).map((_,i)=>i?[]:[4,3,2,1]);break;
 case'nim':s.heaps=s.mode==='Wythoff'?[7,10]:['Fibonacci Nim','Subtraction','Grundy'].includes(s.mode)?[s.mode==='Grundy'?15:21]:[3,4,5];s.limit=20;s.pins=Array(12).fill(1);break;
 case'chomp':s.rows=4;s.cols=6;s.board=Array(24).fill(1);break;
 case'domineering':s.rows=s.cols=6;s.board=Array(36).fill(0);break;
 case'clobber':s.rows=s.cols=5;s.board=range(25).map(i=>(Math.floor(i/5)+i%5)%2+1);break;
 case'hackenbush':s.nodes=[{x:45,y:290},{x:135,y:290},{x:225,y:290},{x:315,y:290},{x:45,y:220},{x:135,y:220},{x:225,y:220},{x:315,y:220},{x:65,y:140},{x:120,y:140},{x:235,y:140},{x:305,y:140},{x:105,y:70},{x:260,y:70}];s.edges=[[0,4,1],[1,5,2],[2,6,1],[3,7,2],[4,8,2],[5,9,1],[6,10,2],[7,11,1],[8,12,1],[9,12,2],[10,13,1],[11,13,2]].map((e,i)=>({a:e[0],b:e[1],color:e[2],live:true,id:i}));break;
 case'sprouts':s.nodes=[{x:100,y:100,d:0},{x:300,y:100,d:0},{x:200,y:280,d:0}];s.edges=[];break;
 case'boxes':s.n=4;s.edges={};s.boxes={};s.scores=[0,0];break;
 case'hex':s.rows=s.cols=5;s.board=Array(25).fill(0);break;
 case'sim':s.nodes=range(6).map(i=>({x:200+150*Math.cos(i*Math.PI/3-Math.PI/2),y:195+150*Math.sin(i*Math.PI/3-Math.PI/2)}));s.edges={};break;
 case'peg':s.cells=[];if(s.mode==='Triangle'){for(let a=0;a<5;a++)for(let b=0;b<=a;b++)s.cells.push({r:a,c:b,v:a?1:0});}else{for(let a=0;a<7;a++)for(let b=0;b<7;b++)if((a>=2&&a<=4)||(b>=2&&b<=4))s.cells.push({r:a,c:b,v:a===3&&b===3?0:1});}break;
 case'lights':s.rows=s.cols=5;s.board=Array(25).fill(0);for(let i=0;i<12;i++)toggleLights(s,Math.floor(r()*25));if(!s.board.some(Boolean))toggleLights(s,0);break;
 case'sliding':if(['Traffic','Klotski'].includes(s.mode)){s.rows=s.mode==='Traffic'?6:5;s.cols=s.mode==='Traffic'?6:4;s.blocks=s.mode==='Traffic'?[{r:2,c:0,w:2,h:1,target:true},{r:0,c:2,w:1,h:3},{r:3,c:1,w:2,h:1},{r:0,c:5,w:1,h:2},{r:5,c:0,w:2,h:1}]:[{r:0,c:1,w:2,h:2,target:true},{r:0,c:0,w:1,h:2},{r:0,c:3,w:1,h:2},{r:2,c:0,w:1,h:2},{r:2,c:3,w:1,h:2},{r:2,c:1,w:2,h:1},{r:3,c:1,w:1,h:1},{r:3,c:2,w:1,h:1},{r:4,c:0,w:1,h:1},{r:4,c:3,w:1,h:1}];}else{s.rows=s.cols=s.mode==='15 Puzzle'?4:3;s.board=range(s.rows*s.cols).map(i=>(i+1)%(s.rows*s.cols));let prev=-1;for(let i=0;i<80;i++){let z=s.board.indexOf(0),ns=neighbors(z,s.cols,s.rows).filter(k=>k!==prev),j=ns[Math.floor(r()*ns.length)];[s.board[z],s.board[j]]=[s.board[j],s.board[z]];prev=z;}if(s.board.every((v,i)=>v===(i+1)%s.board.length)){let z=s.board.indexOf(0),j=neighbors(z,s.cols,s.rows)[0];[s.board[z],s.board[j]]=[s.board[j],s.board[z]];}}break;
 case'frogs':s.board=[1,1,1,0,2,2,2];break;
 case'sudoku':{const base='530070000600195000098000060800060003400803001700020006060000280000419005000080079';let digits=shuffle(range(9).map(i=>i+1),r);s.rows=s.cols=9;s.board=base.split('').map(v=>v==='0'?0:digits[+v-1]);s.fixed=s.board.map(Boolean);s.solution=solveSudoku(s.board);break;}
 case'nonogram':{let patterns=['0010001110111110010000100','0101011111111110111000100','0010000100111110111001010'];s.rows=s.cols=5;s.target=patterns[Math.floor(r()*patterns.length)].split('').map(Number);s.board=Array(25).fill(0);s.rowClues=range(5).map(i=>clues(s.target.slice(i*5,i*5+5)));s.colClues=range(5).map(i=>clues(range(5).map(j=>s.target[j*5+i])));break;}
 case'kakuro':s.rows=s.cols=3;s.board=Array(9).fill(0);s.rowClues=[6,15,24];s.colClues=[12,15,18];break;
 case'mastermind':s.secret=range(4).map(()=>Math.floor(r()*6));s.guesses=[];s.max=10;break;
 case'set':s.deck=shuffle(range(81).map(cardAttrs),r);s.hand=s.deck.splice(0,12);s.found=0;s.goal=5;while(!findSet(s.hand)&&s.deck.length)s.hand.push(...s.deck.splice(0,3));break;
 case'queens':s.rows=s.cols=s.mode==='5 queens'?5:8;s.board=Array(s.rows*s.rows).fill(0);break;
 case'tangram':s.pieces=tangramPieces();s.guide=false;break;
 case'rubik':s.n=s.mode==='2×2'?2:3;s.stickers=cubeStickers(s.n);s.trail=[];let prev='';for(let i=0;i<8;i++){let f=shuffle(['U','D','F','B','L','R'].filter(v=>v!==prev),r)[0];cubeTurn(s,f,1);s.trail.push([f,1]);prev=f;}break;
 case'river':if(s.mode==='Farmer')s.banks=[0,0,0,0];else{s.left=[3,3];s.boat=0;}break;
 case'twentyfour':s.numbers=shuffle([[1,2,3,4],[3,3,8,8],[1,5,5,5],[2,3,4,6],[2,2,6,6],[1,3,4,6]][Math.floor(r()*6)],r);break;
 default:throw Error('Unknown game: '+id);
 }return s;
}
function neighbors(i,w,h){const rr=Math.floor(i/w),c=i%w;return[[rr-1,c],[rr+1,c],[rr,c-1],[rr,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<h&&b<w).map(([a,b])=>a*w+b);}
function toggleLights(s,i){[i,...neighbors(i,s.cols,s.rows)].forEach(k=>s.board[k]^=1);}
function clues(a){let z=[],n=0;for(let v of a){if(v)n++;else if(n){z.push(n);n=0;}}if(n)z.push(n);return z.length?z:[0];}
function finish(s,winner=1,label='Puzzle solved!'){s.won=true;s.winner=winner;s.result=label;}
function next(s){s.player=3-s.player;}
function normalEnd(s,legal){const p=s.player;next(s);if(!legal(s,s.player))finish(s,p,'Player '+p+' wins!');}
function bad(s,msg){return{ok:false,state:s,msg};}
function good(s,msg=''){return{ok:true,state:s,msg};}
function move(original,a){let s=clone(original);if(s.won)return bad(original,'Start a new game to play again.');let p=s.player,changed=true;
 switch(s.id){
 case'hanoi':{const f=a.from,t=a.to;if(!Number.isInteger(f)||!Number.isInteger(t)||f===t||!s.stacks[f]?.length||!s.stacks[t])return bad(original,'Choose a disk and a different peg.');if(s.mode==='Cyclic'&&t!==(f+1)%3)return bad(original,'Only clockwise moves are allowed.');if(s.mode==='Adjacent'&&Math.abs(t-f)!==1)return bad(original,'Move only between neighboring pegs.');let disk=last(s.stacks[f]);if(s.stacks[t].length&&last(s.stacks[t])<disk)return bad(original,'A larger disk cannot sit on a smaller one.');s.stacks[f].pop();s.stacks[t].push(disk);if(last(s.stacks).length===s.n)finish(s);break;}
 case'nim':{
 if(s.mode==='Kayles'){let k=a.index,num=a.amount;if(!Number.isInteger(k)||![1,2].includes(num)||!s.pins[k]||(num===2&&!s.pins[k+1]))return bad(original,'Remove one standing pin or two adjacent standing pins.');s.pins[k]=0;if(num===2)s.pins[k+1]=0;if(!s.pins.some(Boolean))finish(s,p,'Player '+p+' wins!');else next(s);break;}
 let i=a.heap,n=+a.amount;if(!Number.isInteger(n)||n<=0||!Number.isInteger(i)||s.heaps[i]==null)return bad(original,'Choose a heap and a positive whole number.');
 if(s.mode==='Grundy'){if(n>=s.heaps[i]||n===s.heaps[i]-n)return bad(original,'Split into two nonempty, unequal heaps.');let b=s.heaps[i]-n;s.heaps.splice(i,1,n,b);if(!s.heaps.some(v=>v>=3))finish(s,p,'Player '+p+' wins!');else next(s);break;}
 if(s.mode==='Subtraction'&&![1,3,4].includes(n))return bad(original,'You may take only 1, 3, or 4.');
 if(s.mode==='Fibonacci Nim'&&n>s.limit)return bad(original,'This turn you may take at most '+s.limit+'.');
 if(a.both&&s.mode!=='Wythoff')return bad(original,'Only Wythoff allows taking from both heaps.');
 let hs=a.both?[0,1]:[i];if(hs.some(k=>s.heaps[k]<n))return bad(original,'There are not enough counters.');hs.forEach(k=>s.heaps[k]-=n);s.limit=2*n;
 if(!s.heaps.some(Boolean))finish(s,s.mode==='Misère Nim'?3-p:p,'Player '+(s.mode==='Misère Nim'?3-p:p)+' wins!');else next(s);break;}
 case'chomp':{let i=a.index;if(!Number.isInteger(i)||!s.board[i])return bad(original,'Choose a remaining square.');let rr=Math.floor(i/s.cols),c=i%s.cols;for(let x=rr;x<s.rows;x++)for(let y=c;y<s.cols;y++)s.board[x*s.cols+y]=0;if(i===0)finish(s,3-p,'Poison! Player '+(3-p)+' wins.');else next(s);break;}
 case'domineering':{let i=a.index,j=p===1?i+s.cols:i+1;if(!Number.isInteger(i)||i<0||i>=s.board.length||j>=s.board.length||(p===2&&i%s.cols===s.cols-1)||s.board[i]||s.board[j])return bad(original,'Place on two empty squares in your direction.');s.board[i]=s.board[j]=p;normalEnd(s,domLegal);break;}
 case'clobber':{let f=a.from,t=a.to;if(s.board[f]!==p||s.board[t]!==3-p||!neighbors(f,s.cols,s.rows).includes(t))return bad(original,'Capture an adjacent opponent piece horizontally or vertically.');s.board[f]=0;s.board[t]=p;normalEnd(s,clobberLegal);break;}
 case'hackenbush':{let e=s.edges[a.index];if(!e?.live||e.color!==p)return bad(original,'Cut a live edge of your own color.');e.live=false;let connected=new Set([0,1,2,3]),change=true;while(change){change=false;for(let q of s.edges.filter(e=>e.live))if(connected.has(q.a)||connected.has(q.b)){if(!connected.has(q.a)||!connected.has(q.b))change=true;connected.add(q.a);connected.add(q.b);}}s.edges.forEach(q=>{if(!connected.has(q.a)||!connected.has(q.b))q.live=false;});normalEnd(s,(t,pp)=>t.edges.some(e=>e.live&&e.color===pp));break;}
 case'sprouts':{
 let aa=a.from,bb=a.to,path=a.path;
 if(!s.nodes[aa]||!s.nodes[bb]||!Array.isArray(path)||path.length<2)return bad(original,'Draw a curve from one dot to another, or back to itself.');
 if(s.nodes[aa].d+(aa===bb?2:1)>3||s.nodes[bb].d+(aa===bb?2:1)>3)return bad(original,'A dot can have at most three line ends.');
 path=path.map(q=>({x:+q.x,y:+q.y}));
 if(path.some(q=>!Number.isFinite(q.x)||!Number.isFinite(q.y)||q.x<5||q.x>395||q.y<5||q.y>355))return bad(original,'Keep the curve inside the drawing area.');
 path[0]={x:s.nodes[aa].x,y:s.nodes[aa].y};path[path.length-1]={x:s.nodes[bb].x,y:s.nodes[bb].y};path=cleanPath(path);
 let length=path.slice(1).reduce((t,v,i)=>t+Math.hypot(v.x-path[i].x,v.y-path[i].y),0);
 if(length<40)return bad(original,'Draw a longer curve so a new dot can fit.');
 for(let i=0;i<path.length-1;i++){
  for(let j=i+1;j<path.length-1;j++){
   const allowed=[];
   if(j===i+1)allowed.push(path[j]);
   if(aa===bb&&i===0&&j===path.length-2)allowed.push(path[0]);
   if(segmentsConflict(path[i],path[i+1],path[j],path[j+1],allowed))return bad(original,'The curve cannot cross or retrace itself.');
  }
  for(let n=0;n<s.nodes.length;n++){
   const near=q=>Math.hypot(q.x-s.nodes[n].x,q.y-s.nodes[n].y)<18;
   if((n===aa&&path.slice(0,i+1).every(near))||(n===bb&&path.slice(i+1).every(near)))continue;
   if(pointSegment(s.nodes[n],path[i],path[i+1])<7)return bad(original,'A curve cannot pass through another dot.');
  }
  for(let edge of s.edges){
   // Older saves may contain duplicate sample points at the inserted dot.
   const ep=cleanPath(edge.path);
   for(let j=0;j<ep.length-1;j++){
    const allowed=[];
    if(i===0&&((j===0&&aa===edge.a)||(j===ep.length-2&&aa===edge.b)))allowed.push(s.nodes[aa]);
    if(i===path.length-2&&((j===0&&bb===edge.a)||(j===ep.length-2&&bb===edge.b)))allowed.push(s.nodes[bb]);
    if(segmentsConflict(path[i],path[i+1],ep[j],ep[j+1],allowed))return bad(original,'Curves cannot cross or retrace an existing curve.');
   }
  }
 }
 let half=length/2,acc=0,mid,k=0;
 for(;k<path.length-1;k++){let l=Math.hypot(path[k+1].x-path[k].x,path[k+1].y-path[k].y);if(acc+l>=half){let t=(half-acc)/l;mid={x:path[k].x+t*(path[k+1].x-path[k].x),y:path[k].y+t*(path[k+1].y-path[k].y)};break;}acc+=l;}
 const ni=s.nodes.length;s.nodes[aa].d++;s.nodes[bb].d++;s.nodes.push({...mid,d:2});
 s.edges.push({a:aa,b:ni,path:cleanPath([...path.slice(0,k+1),mid])},{a:ni,b:bb,path:cleanPath([mid,...path.slice(k+1)])});next(s);break;}
 case'boxes':{let {type,r,c}=a;if(!['h','v'].includes(type)||!Number.isInteger(r)||!Number.isInteger(c)||r<0||c<0||r>=(type==='h'?s.n:s.n-1)||c>=(type==='h'?s.n-1:s.n))return bad(original,'Choose an undrawn line.');let key=type+':'+r+':'+c;if(s.edges[key])return bad(original,'That line is already drawn.');s.edges[key]=p;let count=0;for(let x=0;x<s.n-1;x++)for(let y=0;y<s.n-1;y++){let q=x+':'+y;if(!s.boxes[q]&&['h:'+x+':'+y,'h:'+(x+1)+':'+y,'v:'+x+':'+y,'v:'+x+':'+(y+1)].every(k=>s.edges[k])){s.boxes[q]=p;s.scores[p-1]++;count++;}}if(Object.keys(s.boxes).length===(s.n-1)**2){let w=s.scores[0]===s.scores[1]?0:s.scores[0]>s.scores[1]?1:2;finish(s,w,w?'Player '+w+' wins!':'A draw!');}else if(!count)next(s);break;}
 case'hex':{let i=a.index;if(!Number.isInteger(i)||i<0||i>=s.board.length||s.board[i])return bad(original,'Place a stone on an empty hexagon.');s.board[i]=p;if(hexConnected(s,p))finish(s,p,'Player '+p+' connects the edges!');else next(s);break;}
 case'sim':{let f=a.from,t=a.to;if(!s.nodes[f]||!s.nodes[t]||f===t)return bad(original,'Choose two different vertices.');let key=[f,t].sort((a,b)=>a-b).join(':');if(s.edges[key])return bad(original,'That connection is already colored.');s.edges[key]=p;if(range(6).some(k=>k!==f&&k!==t&&s.edges[[f,k].sort((a,b)=>a-b).join(':')]===p&&s.edges[[t,k].sort((a,b)=>a-b).join(':')]===p))finish(s,3-p,'Triangle! Player '+(3-p)+' wins.');else next(s);break;}
 case'peg':{let f=s.cells[a.from],t=s.cells[a.to];if(!f?.v||!t||t.v)return bad(original,'Choose a peg, then an empty landing hole.');let dr=t.r-f.r,dc=t.c-f.c,valid=s.mode==='Triangle'?[[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2]]:[[2,0],[-2,0],[0,2],[0,-2]];if(!valid.some(v=>v[0]===dr&&v[1]===dc))return bad(original,'Jump exactly one peg.');let m=s.cells.find(q=>q.r===f.r+dr/2&&q.c===f.c+dc/2);if(!m?.v)return bad(original,'There must be a peg between those holes.');f.v=0;m.v=0;t.v=1;if(s.cells.filter(q=>q.v).length===1)finish(s);break;}
 case'lights':if(!Number.isInteger(a.index)||a.index<0||a.index>=25)return bad(original,'Choose a light.');toggleLights(s,a.index);if(!s.board.some(Boolean))finish(s);break;
 case'sliding':if(s.blocks){let b=s.blocks[a.index];if(!b||!['up','down','left','right'].includes(a.direction))return bad(original,'Select a block and a direction.');let [dr,dc]={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[a.direction];if(s.mode==='Traffic'&&((b.w>b.h&&dr)||(b.h>b.w&&dc)))return bad(original,'Vehicles move only along their length.');let nr=b.r+dr,nc=b.c+dc;if(nr<0||nc<0||nr+b.h>s.rows||nc+b.w>s.cols)return bad(original,'That move leaves the board.');if(s.blocks.some((q,j)=>j!==a.index&&nr<q.r+q.h&&nr+b.h>q.r&&nc<q.c+q.w&&nc+b.w>q.c))return bad(original,'Another block is in the way.');b.r=nr;b.c=nc;if(b.target&&((s.mode==='Traffic'&&b.c+b.w===s.cols)||(s.mode==='Klotski'&&b.r===3&&b.c===1)))finish(s);}else{let z=s.board.indexOf(0),i=a.index;if(!neighbors(z,s.cols,s.rows).includes(i))return bad(original,'Only a tile next to the gap can move.');[s.board[z],s.board[i]]=[s.board[i],s.board[z]];if(s.board.every((v,k)=>v===(k+1)%s.board.length))finish(s);}break;
 case'frogs':{let i=a.index,v=s.board[i];if(!v)return bad(original,'Choose a toad or frog.');let d=v===1?1:-1,t=i+d;if(s.board[t]!==0){t=i+2*d;if(s.board[i+d]!==3-v||s.board[t]!==0)return bad(original,'Slide forward or jump over one opposing piece.');}s.board[i]=0;s.board[t]=v;if(eq(s.board,[2,2,2,0,1,1,1]))finish(s);break;}
 case'sudoku':{let i=a.index,v=a.value;if(!Number.isInteger(i)||i<0||i>=81||s.fixed[i]||!Number.isInteger(v)||v<0||v>9)return bad(original,'Choose an editable square and a digit.');s.board[i]=v;if(s.board.every(Boolean)&&validSudoku(s.board))finish(s);break;}
 case'nonogram':{let i=a.index;if(!Number.isInteger(i)||i<0||i>=25||![-1,0,1].includes(a.value))return bad(original,'Choose a square to fill or mark empty.');s.board[i]=a.value;if(s.board.every((v,k)=>(v===1?1:0)===s.target[k]))finish(s);break;}
 case'kakuro':{let i=a.index,v=a.value;if(!Number.isInteger(i)||i<0||i>=9||!Number.isInteger(v)||v<0||v>9)return bad(original,'Choose a square and a digit.');s.board[i]=v;if(kakuroValid(s))finish(s);break;}
 case'mastermind':{let g=a.guess;if(!Array.isArray(g)||g.length!==4||g.some(v=>!Number.isInteger(v)||v<0||v>5))return bad(original,'Choose four colors.');let exact=0,aa=Array(6).fill(0),bb=Array(6).fill(0);g.forEach((v,i)=>{if(v===s.secret[i])exact++;else{aa[v]++;bb[s.secret[i]]++;}});let partial=aa.reduce((t,v,i)=>t+Math.min(v,bb[i]),0);s.guesses.push({guess:g,exact,partial});if(exact===4)finish(s,1,'Code cracked!');else if(s.guesses.length>=s.max)finish(s,0,'Out of guesses. The secret is revealed.');break;}
 case'set':if(a.add){if(findSet(s.hand))return bad(original,'A SET is available. Look again, or ask for a hint.');if(!s.deck.length)return bad(original,'No cards remain in the deck.');s.hand.push(...s.deck.splice(0,3));}else{let ids=a.indices;if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(i=>!s.hand[i])||!isSet(ids.map(i=>s.hand[i])))return bad(original,'For each feature, all three must be the same or all different.');ids.sort((a,b)=>b-a).forEach(i=>s.hand.splice(i,1));while(s.hand.length<12&&s.deck.length)s.hand.push(s.deck.shift());s.found++;if(s.found>=s.goal)finish(s,1,'Five SETs found!');else if(!s.deck.length&&!findSet(s.hand))finish(s,1,'All available SETs found!');}break;
 case'queens':{let i=a.index;if(!Number.isInteger(i)||i<0||i>=s.board.length)return bad(original,'Choose a square.');s.board[i]^=1;if(s.board.filter(Boolean).length===s.rows&&queenConflicts(s).length===0)finish(s);break;}
 case'tangram':{let b=s.pieces[a.index];if(!b)return bad(original,'Choose a piece.');if(a.rotate)b.angle=(b.angle+45)%360;else if(a.flip)b.flip=!b.flip;else if(!(Number.isFinite(a.x)&&Number.isFinite(a.y)))return bad(original,'Drag, rotate, or flip a piece.');if(Number.isFinite(a.x)&&Number.isFinite(a.y)){b.x=Math.max(0,Math.min(500,a.x));b.y=Math.max(0,Math.min(420,a.y));}keepPieceOnBoard(b);if(tangramSolved(s))finish(s);break;}
 case'rubik':if(!['U','D','F','B','L','R',...(s.n===3?['M','E','S']:[])].includes(a.face)||![1,-1].includes(a.direction))return bad(original,'Choose a face turn.');cubeTurn(s,a.face,a.direction);if(s.trail.length&&last(s.trail)[0]===a.face&&last(s.trail)[1]===-a.direction)s.trail.pop();else s.trail.push([a.face,a.direction]);if(cubeSolved(s))finish(s);break;
 case'river':if(s.mode==='Farmer'){let side=s.banks[0],cargo=+a.cargo;if(![-1,1,2,3].includes(cargo)||cargo!==-1&&s.banks[cargo]!==side)return bad(original,'Take one passenger from the farmer’s bank, or cross alone.');s.banks[0]^=1;if(cargo!==-1)s.banks[cargo]^=1;if((s.banks[1]===s.banks[2]&&s.banks[0]!==s.banks[1])||(s.banks[2]===s.banks[3]&&s.banks[0]!==s.banks[2]))return bad(original,'Unsafe: the wolf eats the goat, or the goat eats the cabbage.');if(s.banks.every(v=>v===1))finish(s);}else{let m=+a.m,c=+a.c;if(!Number.isInteger(m)||!Number.isInteger(c)||m<0||c<0||m+c<1||m+c>2)return bad(original,'The boat carries one or two people.');let sign=s.boat===0?-1:1,L=[s.left[0]+sign*m,s.left[1]+sign*c];if(L.some(v=>v<0||v>3)||(L[0]>0&&L[1]>L[0])||(3-L[0]>0&&3-L[1]>3-L[0]))return bad(original,'Missionaries cannot be outnumbered on either bank.');s.left=L;s.boat^=1;if(L.every(v=>v===0))finish(s);}break;
 case'twentyfour':{let v;try{v=parseExpression(a.expression,s.numbers);}catch(e){return bad(original,e.message);}if(Math.abs(v-24)>1e-8)return bad(original,'That equals '+Number(v.toFixed(6))+'. Aim for 24.');finish(s,1,'Exactly 24!');break;}
 default:changed=false;
 }if(!changed)return bad(original,'Unknown action.');s.moves++;return good(s);
}
function domLegal(s,p){return s.board.some((v,i)=>!v&&(p===1?i+s.cols<s.board.length&&!s.board[i+s.cols]:i%s.cols<s.cols-1&&!s.board[i+1]));}
function clobberLegal(s,p){return s.board.some((v,i)=>v===p&&neighbors(i,s.cols,s.rows).some(j=>s.board[j]===3-p));}
function hexConnected(s,p){let n=s.cols,q=[],seen=new Set();for(let i=0;i<n;i++){let k=p===1?i:i*n;if(s.board[k]===p){q.push(k);seen.add(k);}}while(q.length){let k=q.shift(),r=Math.floor(k/n),c=k%n;if(p===1?r===n-1:c===n-1)return true;for(let [rr,cc]of[[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c+1],[r+1,c-1]])if(rr>=0&&cc>=0&&rr<n&&cc<n){let j=rr*n+cc;if(s.board[j]===p&&!seen.has(j)){seen.add(j);q.push(j);}}}return false;}
function validSudoku(a){for(let i=0;i<9;i++){let row=a.slice(i*9,i*9+9).filter(Boolean),col=range(9).map(k=>a[k*9+i]).filter(Boolean);if(new Set(row).size!==row.length||new Set(col).size!==col.length)return false;}for(let r=0;r<9;r+=3)for(let c=0;c<9;c+=3){let b=[];for(let x=r;x<r+3;x++)for(let y=c;y<c+3;y++)if(a[x*9+y])b.push(a[x*9+y]);if(new Set(b).size!==b.length)return false;}return true;}
function solveSudoku(board){let a=board.slice();function go(){let best=-1,opts=[];for(let i=0;i<81;i++)if(!a[i]){let os=range(9).map(v=>v+1).filter(v=>{a[i]=v;let b=validSudoku(a);a[i]=0;return b;});if(!os.length)return false;if(best<0||os.length<opts.length){best=i;opts=os;}if(os.length===1)break;}if(best<0)return true;for(let v of opts){a[best]=v;if(go())return true;}a[best]=0;return false;}return go()?a:null;}
function kakuroValid(s){if(s.board.some(v=>v<1||v>9))return false;return range(3).every(i=>{let a=s.board.slice(i*3,i*3+3),b=range(3).map(j=>s.board[j*3+i]);return new Set(a).size===3&&new Set(b).size===3&&a.reduce((t,v)=>t+v,0)===s.rowClues[i]&&b.reduce((t,v)=>t+v,0)===s.colClues[i];});}
function cardAttrs(i){return range(4).map(()=>{let v=i%3;i=Math.floor(i/3);return v;});}
function isSet(cards){return cards.length===3&&range(4).every(i=>(cards[0][i]+cards[1][i]+cards[2][i])%3===0);}
function findSet(hand){for(let i=0;i<hand.length;i++)for(let j=i+1;j<hand.length;j++)for(let k=j+1;k<hand.length;k++)if(isSet([hand[i],hand[j],hand[k]]))return[i,j,k];return null;}
function queenConflicts(s){let a=range(s.board.length).filter(i=>s.board[i]),out=new Set();for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){let x=a[i],y=a[j],dr=Math.abs(Math.floor(x/s.cols)-Math.floor(y/s.cols)),dc=Math.abs(x%s.cols-y%s.cols);if(dr===0||dc===0||dr===dc){out.add(x);out.add(y);}}return[...out];}
function cubeStickers(n){let vals=n===2?[-1,1]:[-1,0,1],out=[];for(let f of['U','L','F','R','B','D'])for(let r=0;r<n;r++)for(let c=0;c<n;c++){let x=vals[c],y=-vals[r],z=vals[r],pos,norm;switch(f){case'U':pos=[x,1,z];norm=[0,1,0];break;case'D':pos=[x,-1,-z];norm=[0,-1,0];break;case'F':pos=[x,y,1];norm=[0,0,1];break;case'B':pos=[-x,y,-1];norm=[0,0,-1];break;case'R':pos=[1,y,-x];norm=[1,0,0];break;case'L':pos=[-1,y,x];norm=[-1,0,0];break;}out.push({pos,norm,color:f});}return out;}
// Slices follow standard notation: M turns like L, E like D, S like F.
const CUBE_LAYERS={U:[1,1,1],D:[1,-1,-1],F:[2,1,1],B:[2,-1,-1],R:[0,1,1],L:[0,-1,-1],M:[0,0,-1],E:[1,0,-1],S:[2,0,1]};
function cubeTurn(s,face,d){let [axis,side,ref]=CUBE_LAYERS[face],q=-ref*d;function rot(v){let [x,y,z]=v;if(axis===0)return[x,-q*z,q*y];if(axis===1)return[q*z,y,-q*x];return[-q*y,q*x,z];}for(let st of s.stickers)if(st.pos[axis]===side){st.pos=rot(st.pos);st.norm=rot(st.norm);}}
function cubeFaces(s){let result={};for(let f of['U','L','F','R','B','D']){let tmpl=cubeStickers(s.n).filter(st=>st.color===f);result[f]=tmpl.map(t=>s.stickers.find(st=>eq(st.pos,t.pos)&&eq(st.norm,t.norm)).color);}return result;}
function cubeSolved(s){return Object.values(cubeFaces(s)).every(a=>a.every(v=>v===a[0]));}
function tangramPieces(){let polys=[[[0,0],[200,0],[100,100]],[[0,0],[100,100],[0,200]],[[0,0],[0,100],[-50,50]],[[0,0],[50,-50],[100,0],[50,50]],[[0,0],[0,100],[-100,100]],[[0,0],[50,50],[-50,50]],[[0,0],[50,-50],[150,-50],[100,0]]];let targets=[[140,80],[140,80],[340,80],[240,180],[340,180],[240,180],[140,280]];return polys.map((poly,i)=>({poly,x:[110,290,410,70,400,220,170][i],y:[20,15,310,320,120,330,350][i],angle:[90,0,180,45,90,180,0][i],flip:false,target:targets[i]}));}
function piecePoly(b){let a=b.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return b.poly.map(([x,y])=>{x=b.flip?-x:x;return{x:b.x+c*x-s*y,y:b.y+s*x+c*y};});}
function keepPieceOnBoard(b){
 const offsets=piecePoly({...b,x:0,y:0});
 for(const [axis,size] of [['x',500],['y',420]]){
  const min=Math.min(...offsets.map(v=>v[axis])),max=Math.max(...offsets.map(v=>v[axis]));
  const low=Math.ceil((-min-1e-7)/10)*10,high=Math.floor((size-max+1e-7)/10)*10;
  b[axis]=Math.max(low,Math.min(high,b[axis]));
 }
}
function polygonsOverlap(a,b){for(let p of[a,b])for(let i=0;i<p.length;i++){let q=p[(i+1)%p.length],v=p[i],axis={x:q.y-v.y,y:v.x-q.x},pa=a.map(k=>k.x*axis.x+k.y*axis.y),pb=b.map(k=>k.x*axis.x+k.y*axis.y);if(Math.max(...pa)<=Math.min(...pb)+.01||Math.max(...pb)<=Math.min(...pa)+.01)return false;}return true;}
function tangramSolved(s){let ps=s.pieces.map(piecePoly);if(ps.some(p=>p.some(v=>v.x<139.9||v.x>340.1||v.y<79.9||v.y>280.1)))return false;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)if(polygonsOverlap(ps[i],ps[j]))return false;return true;}
function pointSegment(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,t=((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1);t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function segmentsCross(a,b,c,d){let cross=(u,v,w)=>(v.x-u.x)*(w.y-u.y)-(v.y-u.y)*(w.x-u.x);let x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);if(x*y<0&&z*w<0)return true;if(Math.abs(x)<.0001&&pointSegment(c,a,b)<.01)return true;if(Math.abs(y)<.0001&&pointSegment(d,a,b)<.01)return true;if(Math.abs(z)<.0001&&pointSegment(a,c,d)<.01)return true;if(Math.abs(w)<.0001&&pointSegment(b,c,d)<.01)return true;return false;}
function cleanPath(path){return path.filter((p,i)=>!i||Math.hypot(p.x-path[i-1].x,p.y-path[i-1].y)>1e-7);}
function segmentsConflict(a,b,c,d,allowed){
 if(!segmentsCross(a,b,c,d))return false;
 const same=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y)<1e-7;
 for(const p of allowed){
  if(!(same(p,a)||same(p,b))||!(same(p,c)||same(p,d)))continue;
  const q=same(p,a)?b:a,r=same(p,c)?d:c;
  const ux=q.x-p.x,uy=q.y-p.y,vx=r.x-p.x,vy=r.y-p.y;
  // A junction is legal only if the segments share this point alone.
  if(Math.abs(ux*vy-uy*vx)>1e-7||ux*vx+uy*vy<=0)return false;
 }
 return true;
}
function parseExpression(expr,numbers){if(typeof expr!=='string'||expr.length>150||/[^\d\s()+*/−×÷-]/.test(expr))throw Error('Use the four numbers, + − × ÷, and parentheses only.');expr=expr.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/');let tokens=expr.match(/\d+|[()+*/-]/g)||[],used=tokens.filter(x=>/^\d+$/.test(x)).map(Number).sort((a,b)=>a-b);if(!eq(used,numbers.slice().sort((a,b)=>a-b)))throw Error('Use each given number exactly once.');let i=0;function atom(){let t=tokens[i++];if(t==='('){let v=sum();if(tokens[i++]!==')')throw Error('Check your parentheses.');return v;}if(!t||!/^\d+$/.test(t))throw Error('Check your expression.');return+t;}function product(){let v=atom();while(['*','/'].includes(tokens[i])){let op=tokens[i++],w=atom();if(op==='/'&&Math.abs(w)<1e-12)throw Error('Division by zero is not allowed.');v=op==='*'?v*w:v/w;}return v;}function sum(){let v=product();while(['+','-'].includes(tokens[i])){let op=tokens[i++],w=product();v=op==='+'?v+w:v-w;}return v;}let result=sum();if(i!==tokens.length||!Number.isFinite(result))throw Error('Check your expression.');return result;}
function solve24(nums){function go(items){if(items.length===1)return Math.abs(items[0].v-24)<1e-9?items[0].e:null;for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){let a=items[i],b=items[j],rest=items.filter((_,k)=>k!==i&&k!==j),candidates=[[a.v+b.v,'('+a.e+'+'+b.e+')'],[a.v-b.v,'('+a.e+'-'+b.e+')'],[b.v-a.v,'('+b.e+'-'+a.e+')'],[a.v*b.v,'('+a.e+'*'+b.e+')']];if(Math.abs(b.v)>1e-12)candidates.push([a.v/b.v,'('+a.e+'/'+b.e+')']);if(Math.abs(a.v)>1e-12)candidates.push([b.v/a.v,'('+b.e+'/'+a.e+')']);for(let[v,e]of candidates){let answer=go([...rest,{v,e}]);if(answer)return answer;}}return null;}return go(nums.map(v=>({v,e:String(v)})));}
function lightsSolution(s){let n=s.board.length,m=range(n).map(i=>{let row=Array(n+1).fill(0);[i,...neighbors(i,s.cols,s.rows)].forEach(j=>row[j]=1);row[n]=s.board[i];return row;});let pivots=[],k=0;for(let c=0;c<n;c++){let p=m.findIndex((r,i)=>i>=k&&r[c]);if(p<0)continue;[m[k],m[p]]=[m[p],m[k]];for(let i=0;i<n;i++)if(i!==k&&m[i][c])for(let j=c;j<=n;j++)m[i][j]^=m[k][j];pivots.push(c);k++;}if(m.some(row=>!row.slice(0,n).some(Boolean)&&row[n]))return null;let x=Array(n).fill(0);pivots.forEach((c,i)=>x[c]=m[i][n]);return range(n).filter(i=>x[i]);}
function shortestFrog(s){let start=s.board,goal='2220111',q=[[start,[]]],seen=new Set([start.join('')]);while(q.length){let [a,path]=q.shift();if(a.join('')===goal)return path;for(let i=0;i<7;i++){let t=move({...s,board:a,won:false},{index:i});if(t.ok){let key=t.state.board.join('');if(!seen.has(key)){seen.add(key);q.push([t.state.board,[...path,i]]);}}}}return null;}
const API={init,move,MODES,clone,range,neighbors,eq,validSudoku,solveSudoku,kakuroValid,isSet,findSet,queenConflicts,cubeTurn,CUBE_LAYERS,cubeFaces,cubeSolved,piecePoly,keepPieceOnBoard,tangramSolved,parseExpression,solve24,lightsSolution,shortestFrog,domLegal,clobberLegal,hexConnected,segmentsCross};
if(typeof module!=='undefined')module.exports=API;root.KilalaoEngine=API;
})(typeof window!=='undefined'?window:globalThis);
