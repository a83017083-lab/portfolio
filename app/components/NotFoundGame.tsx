"use client";

import {useState} from "react";
const CELLS=["⌘","✳","↗","◇","⚡","⊙","△","❋","◎"];
export default function NotFoundGame(){
 const [target,setTarget]=useState<number|null>(null),[attempts,setAttempts]=useState(0),[picked,setPicked]=useState<number|null>(null);
 const [finished,setFinished]=useState(false);
 function start(){setTarget(Math.floor(Math.random()*CELLS.length));setAttempts(0);setPicked(null);setFinished(false)}
 function choose(index:number){if(target===null||finished)return;setPicked(index);setAttempts(a=>a+1);if(index===target)setFinished(true)}
 return <div className="v2-404-game"><h2>A tiny detour?</h2><p>Find the hidden spark in the grid. You can leave for the homepage any time.</p>
  {target===null?<button type="button" onClick={start}>Play the 404 game ↗</button>:<><div className="v2-404-grid" aria-label="Nine choices to find the hidden spark">{CELLS.map((symbol,i)=><button key={i} type="button" onClick={()=>choose(i)} disabled={finished||picked===i&&i!==target} aria-label={`Tile ${i+1}`} className={picked===i?(finished?"found":"miss"):""}>{finished&&i===target?"✳":symbol}</button>)}</div><p role="status">{finished?`Found it in ${attempts} ${attempts===1?"try":"tries"}!`:picked===null?"Pick a tile.":"Not that one. Try another."}</p><button type="button" onClick={start}>New round</button></>}
 </div>;
}
