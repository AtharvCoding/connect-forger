(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAeCAYAAADD0FVVAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABIUlEQVRIicWVOw7CMAyGfQ9WBANHIBILl+jEATgAExJH4EqwMSB16MLGBgtInToaNUoqY+w8KKLDryRO/MVJXBcQEX4tUCcAMKYsKADg81ZZXapD1+djDQwhIAfxDTQwpEA14DBQIA9gjLEKQf0a6eGAR0ehKeK++Aa9fx4tBAtdBUjHlxw0qcdHBz0fd9GEl+T9RGhzLe1kXZ6sNvutlR9LNuoXhTbXsgO0fS9qi0KR3KuHxuShPFdBSn4OpfcnQZMLSh2JVgPi30tfsV5ZOWd8jMa2FebSSl/hHDQohSdXqYJB58uFhbatsul30Mls2g8KTjGo9mAgQXmd1OTXZUdaKMqKFJW04htl5ynKuSraen1RqNiyoYb8hzTb8JH20Qv/JSl9j3siAwAAAABJRU5ErkJggg==`,t=e=>e===1?2:1;function n(){return Array.from({length:6},()=>Array(7).fill(0))}function r(e){return e.map(e=>e.slice())}function i(e,t){if(t<0||t>=7)return-1;for(let n=5;n>=0;n--)if(e[n][t]===0)return n;return-1}function a(e){return e[0].every(e=>e!==0)}var o=[[0,1],[1,0],[1,1],[1,-1]];function s(e,t,n){let r=e[t]?.[n];if(!r)return null;for(let[i,a]of o){let o=[{row:t,col:n}];for(let s of[1,-1]){let c=t+i*s,l=n+a*s;for(;c>=0&&c<6&&l>=0&&l<7&&e[c][l]===r;)o.push({row:c,col:l}),c+=i*s,l+=a*s}if(o.length>=4)return o.sort((e,t)=>e.row-t.row||e.col-t.col)}return null}function c(e=1){return{board:n(),turn:e,outcome:{kind:`playing`},moves:[]}}function l(e,n){if(e.outcome.kind!==`playing`)return null;let o=i(e.board,n);if(o<0)return null;let c=r(e.board);c[o][n]=e.turn;let l={row:o,col:n},u=s(c,o,n),d=u?{kind:`win`,winner:e.turn,line:u}:a(c)?{kind:`draw`}:{kind:`playing`};return{state:{board:c,turn:t(e.turn),outcome:d,moves:[...e.moves,l]},pos:l}}var u=`connect-forger:muted`,d=null,f=(()=>{try{return localStorage.getItem(u)===`1`}catch{return!1}})(),p=()=>f;function ee(e){f=e;try{localStorage.setItem(u,e?`1`:`0`)}catch{}}function m(){if(f)return null;try{return d??=new AudioContext,d.state===`suspended`&&d.resume(),d}catch{return null}}function h(e,t,n,r,i=.18,a){let o=m();if(!o)return;let s=o.currentTime+t,c=o.createOscillator(),l=o.createGain();c.type=r,c.frequency.setValueAtTime(e,s),a&&c.frequency.exponentialRampToValueAtTime(a,s+n),l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(i,s+.01),l.gain.exponentialRampToValueAtTime(1e-4,s+n),c.connect(l).connect(o.destination),c.start(s),c.stop(s+n+.02)}function te(e,t,n=.12){let r=m();if(!r)return;let i=r.currentTime+e,a=r.createBuffer(1,Math.ceil(r.sampleRate*t),r.sampleRate),o=a.getChannelData(0);for(let e=0;e<o.length;e++)o[e]=(Math.random()*2-1)*(1-e/o.length)**3;let s=r.createBufferSource(),c=r.createBiquadFilter();c.type=`lowpass`,c.frequency.value=1800;let l=r.createGain();l.gain.value=n,s.buffer=a,s.connect(c).connect(l).connect(r.destination),s.start(i)}var g={click:()=>h(880,0,.05,`square`,.05),drop:e=>{te(0,.08,.16),h(150+e*22,0,.14,`sine`,.22,70)},bump:()=>h(110,0,.12,`square`,.06,80),win:()=>[523,659,784,1047].forEach((e,t)=>h(e,t*.11,.28,`triangle`,.16)),lose:()=>[392,330,262,196].forEach((e,t)=>h(e,t*.14,.3,`triangle`,.14)),draw:()=>[440,415].forEach((e,t)=>h(e,t*.18,.32,`triangle`,.14))},_={1:{key:`anya`,name:`Anya Forger`,short:`Anya`,codename:`Subject 007`,alias:`Telepath (unconfirmed)`},2:{key:`loid`,name:`Loid Forger`,short:`Loid`,codename:`Twilight`,alias:`Psychiatrist (cover)`}},v={1:{move:[`Waku waku!`,`Anya’s turn!`,`Heh.`,`Anya knows where to go.`],win:[`Anya won! Peanuts please!`],lose:[`Anya… is sad.`],draw:[`Nobody won?!`]},2:{move:[`Precisely as planned.`,`Hm.`,`Next phase.`,`Proceeding.`],win:[`Mission accomplished.`],lose:[`…An unexpected variable.`],draw:[`A stalemate. Acceptable.`]}},y=[{id:`easy`,label:`Easy`,note:`Rookie`},{id:`medium`,label:`Medium`,note:`Field agent`},{id:`hard`,label:`Hard`,note:`WISE elite`}],b=`connect-forger:settings`,ne=()=>{let e={mode:`ai`,human:1,level:`medium`,first:`anya`};try{return{...e,...JSON.parse(localStorage.getItem(b)??`{}`)}}catch{return e}},re=e=>{try{localStorage.setItem(b,JSON.stringify(e))}catch{}},ie=matchMedia(`(prefers-reduced-motion: reduce)`),ae=e=>new Promise(t=>setTimeout(t,ie.matches?Math.min(e,150):e)),x=e=>e[Math.floor(Math.random()*e.length)],S=(e,t=document)=>t.querySelector(e),C=new Worker(new URL(new URL(`ai.worker-gB3BItz2.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),oe=0,w=new Map;C.onmessage=e=>{w.get(e.data.id)?.(e.data.col),w.delete(e.data.id)};var se=e=>new Promise(t=>{let n=++oe;w.set(n,t),C.postMessage({...e,id:n})}),T=ne(),E=c(),D=1,O=1,k={1:0,2:0,draws:0},A=!1,j=3,M=0,N=e=>T.mode===`local`||e===T.human,ce=e=>T.mode===`local`?`Player ${e}`:e===T.human?`You`:`Computer · ${y.find(e=>e.id===T.level).label}`,le=S(`#app`);le.innerHTML=`
  <main class="screen menu" id="menu">
    <article class="folder">
      <div class="folder-tab">FILE No. 0417 &middot; EYES ONLY</div>
      <div class="stamp stamp-secret" aria-hidden="true">Top secret</div>
      <header class="brief-head">
        <p class="kicker">WISE &middot; Operation Strix &middot; Side mission</p>
        <h1 class="title">Connect <span>Forger</span></h1>
        <p class="lede">Drop your pieces. Line up four in a row: across, down or diagonal. First agent to do it wins.</p>
      </header>

      <div class="lineup" aria-hidden="true">
        <figure class="mugshot"><div class="photo"><div class="sprite anya"></div></div><figcaption>Anya</figcaption></figure>
        <span class="vs">VS</span>
        <figure class="mugshot"><div class="photo"><img class="sprite loid" src="${e}" alt="" /></div><figcaption>Loid</figcaption></figure>
      </div>

      <form class="options" id="options">
        <fieldset>
          <legend>Mission type</legend>
          <div class="seg">
            <label><input type="radio" name="mode" value="ai" /><span>Vs computer</span></label>
            <label><input type="radio" name="mode" value="local" /><span>2 players, 1 device</span></label>
          </div>
        </fieldset>
        <fieldset data-ai-only>
          <legend>Your agent</legend>
          <div class="seg">
            <label><input type="radio" name="human" value="1" /><span>Anya</span></label>
            <label><input type="radio" name="human" value="2" /><span>Loid</span></label>
          </div>
        </fieldset>
        <fieldset data-ai-only>
          <legend>Opponent clearance</legend>
          <div class="seg">
            ${y.map(e=>`<label><input type="radio" name="level" value="${e.id}" /><span>${e.label}<small>${e.note}</small></span></label>`).join(``)}
          </div>
        </fieldset>
        <fieldset>
          <legend>First move</legend>
          <div class="seg">
            <label><input type="radio" name="first" value="anya" /><span>Anya</span></label>
            <label><input type="radio" name="first" value="loid" /><span>Loid</span></label>
            <label><input type="radio" name="first" value="random" /><span>Coin toss</span></label>
          </div>
        </fieldset>
        <button class="btn btn-primary" type="submit">Begin mission</button>
      </form>
    </article>
    <footer class="credits">
      Fan-made and non-commercial. SPY&times;FAMILY &copy; Tatsuya Endo / Shueisha.
      Pixel sprites: Anya by DarkusShadow, Loid by Hokky1 (DeviantArt).
    </footer>
  </main>

  <main class="screen game" id="game" hidden>
    <header class="topbar">
      <button class="icon-btn" id="back" type="button" aria-label="Back to briefing">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg><span>Briefing</span>
      </button>
      <div class="topbar-title">
        <strong>Connect Forger</strong>
        <span id="round-info"></span>
      </div>
      <button class="icon-btn" id="mute" type="button" aria-pressed="false" aria-label="Mute sound">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9h4l5-4v14l-5-4H4z" /><path class="on" d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /><path class="off" d="M16 9l5 6M21 9l-5 6" /></svg>
      </button>
    </header>

    <div class="arena">
      ${[1,2].map(t=>`
        <section class="agent" data-p="${t}" aria-label="${_[t].name}">
          <div class="bubble" aria-hidden="true"></div>
          <div class="photo">
            ${t===1?`<div class="sprite anya"></div>`:`<img class="sprite loid" src="${e}" alt="" />`}
            <div class="card-stamp" aria-hidden="true"></div>
          </div>
          <div class="agent-info">
            <p class="role"></p>
            <h2>${_[t].short}<span class="surname"> Forger</span></h2>
            <dl>
              <div><dt>Codename</dt><dd>${_[t].codename}</dd></div>
              <div><dt>Cover</dt><dd>${_[t].alias}</dd></div>
            </dl>
          </div>
          <div class="tally"><span class="chip"></span><b class="wins">0</b><small>wins</small></div>
        </section>`).join(``)}

      <div class="table">
        <div class="preview" aria-hidden="true"><div class="ghost"></div></div>
        <div class="board" id="board">
          <div class="pieces"></div>
          <div class="face" aria-hidden="true"></div>
          <div class="hits" role="group" aria-label="Board columns">
            ${Array.from({length:7},(e,t)=>`<button type="button" class="hit" data-col="${t}" aria-label="Column ${t+1}"></button>`).join(``)}
          </div>
          <div class="board-stamp" aria-hidden="true"></div>
        </div>
        <div class="dock">
          <p class="status" id="status" aria-live="polite"></p>
          <div class="result-actions" hidden>
            <button class="btn btn-primary" id="rematch" type="button">Rematch</button>
            <button class="btn" id="to-menu" type="button">Change mission</button>
          </div>
        </div>
      </div>
    </div>
    <p class="hint">Tap a column, or use <kbd>&larr;</kbd><kbd>&rarr;</kbd> and <kbd>Enter</kbd>. Keys <kbd>1</kbd>&ndash;<kbd>7</kbd> drop straight in.</p>
  </main>
`;var P=S(`#menu`),F=S(`#game`),I=S(`#options`),L=S(`#board`),R=S(`.pieces`,L),z=S(`.ghost`),B=S(`#status`),V=S(`.result-actions`),H=S(`.board-stamp`),U={1:S(`.agent[data-p="1"]`),2:S(`.agent[data-p="2"]`)};function W(){for(let[e,t]of Object.entries(T)){let n=I.querySelector(`input[name="${e}"][value="${t}"]`);n&&(n.checked=!0)}I.querySelectorAll(`[data-ai-only]`).forEach(e=>e.hidden=T.mode!==`ai`)}I.addEventListener(`change`,()=>{let e=new FormData(I);T={mode:e.get(`mode`),human:Number(e.get(`human`)),level:e.get(`level`),first:e.get(`first`)},re(T),W(),g.click()}),I.addEventListener(`submit`,e=>{e.preventDefault(),g.click(),k={1:0,2:0,draws:0},D=1,O=T.first===`anya`?1:T.first===`loid`?2:Math.random()<.5?1:2,P.hidden=!0,F.hidden=!1,J(),S(`.hit[data-col="${j}"]`).focus({preventScroll:!0})});function G(){M++,A=!1,F.hidden=!0,P.hidden=!1,W()}S(`#back`).addEventListener(`click`,G),S(`#to-menu`).addEventListener(`click`,G);var K=S(`#mute`),q=()=>{K.setAttribute(`aria-pressed`,String(p())),K.setAttribute(`aria-label`,p()?`Unmute sound`:`Mute sound`),K.classList.toggle(`muted`,p())};K.addEventListener(`click`,()=>{ee(!p()),q(),g.click()}),q();function J(){M++,E=c(O),A=!1,R.replaceChildren(),L.classList.remove(`over`),H.className=`board-stamp`,H.textContent=``,V.hidden=!0;for(let e of[1,2])U[e].classList.remove(`won`,`lost`),S(`.card-stamp`,U[e]).textContent=``,S(`.role`,U[e]).textContent=ce(e),S(`.wins`,U[e]).textContent=String(k[e]);S(`#round-info`).textContent=`Round ${D} · Draws ${k.draws}`,Y(),ue()}S(`#rematch`).addEventListener(`click`,()=>{g.click(),D++,O=t(O),J(),S(`.hit[data-col="${j}"]`).focus({preventScroll:!0})});function Y(e=!1){let n=E.turn;for(let e of[1,2])U[e].classList.toggle(`active`,E.outcome.kind===`playing`&&e===n);U[n].classList.toggle(`thinking`,e),U[t(n)].classList.remove(`thinking`),L.dataset.turn=String(n),L.classList.toggle(`locked`,A||!N(n)),B.textContent=E.outcome.kind===`playing`?e?`${_[n].short} is calculating…`:T.mode===`ai`?N(n)?`Your move, ${_[n].short}.`:`${_[n].short}’s move.`:`${_[n].short}’s move (Player ${n}).`:``,X()}function X(){let e=E.outcome.kind===`playing`&&!A&&N(E.turn)&&i(E.board,j)>=0;z.className=`ghost piece p${E.turn}`,z.style.setProperty(`--col`,String(j)),z.hidden=!e,document.querySelectorAll(`.hit`).forEach((e,t)=>e.classList.toggle(`cursor`,t===j))}async function Z(e){if(!A&&E.outcome.kind===`playing`&&N(E.turn)){if(j=e,i(E.board,e)<0){g.bump();let t=S(`.hit[data-col="${e}"]`);t.classList.remove(`nope`),t.offsetWidth,t.classList.add(`nope`)}else await Q(e)}}async function Q(e){let t=E.turn,n=l(E,e);if(!n)return;let r=M;A=!0,E=n.state,Y(),await fe(n.pos,t),r===M&&(A=!1,E.outcome.kind===`playing`?(Math.random()<.28&&$(t,x(v[t].move)),Y(),ue()):pe())}async function ue(){if(T.mode!==`ai`||E.outcome.kind!==`playing`||N(E.turn))return;let e=M;A=!0,Y(!0);let[t]=await Promise.all([se({board:E.board,player:E.turn,level:T.level}),ae(500+Math.random()*400)]);e===M&&(U[E.turn].classList.remove(`thinking`),await Q(t))}function de(e,t){let n=document.createElement(`div`);return n.className=`piece p${e}`,n.style.gridRow=String(t.row+1),n.style.gridColumn=String(t.col+1),n.dataset.r=String(t.row),n.dataset.c=String(t.col),n}async function fe(e,t){let n=de(t,e);R.append(n);let r=`translateY(${-(e.row+1)*100-8}%)`;if(ie.matches)g.drop(e.row);else{let t=260+e.row*55,i=n.animate([{transform:r,easing:`cubic-bezier(.55,0,1,.45)`},{transform:`translateY(0)`,offset:.72,easing:`cubic-bezier(0,.55,.45,1)`},{transform:`translateY(-14%)`,offset:.86,easing:`cubic-bezier(.55,0,1,.45)`},{transform:`translateY(0)`}],{duration:t});setTimeout(()=>g.drop(e.row),t*.72),await Promise.race([i.finished.catch(()=>void 0),new Promise(e=>setTimeout(e,t+60))])}}function pe(){let e=E.outcome;L.classList.add(`over`);for(let e of[1,2])U[e].classList.remove(`active`,`thinking`);if(e.kind===`win`){k[e.winner]++;let n=t(e.winner),r=new Set(e.line.map(e=>`${e.row},${e.col}`));R.querySelectorAll(`.piece`).forEach(e=>e.classList.toggle(`win`,r.has(`${e.dataset.r},${e.dataset.c}`))),U[e.winner].classList.add(`won`),U[n].classList.add(`lost`),S(`.card-stamp`,U[e.winner]).textContent=`Complete`,S(`.card-stamp`,U[n]).textContent=`Compromised`,S(`.wins`,U[e.winner]).textContent=String(k[e.winner]),$(e.winner,x(v[e.winner].win)),setTimeout(()=>$(n,x(v[n].lose)),700);let i=T.mode===`ai`&&e.winner!==T.human;i?g.lose():g.win(),B.textContent=T.mode===`ai`?e.winner===T.human?`Mission complete. ${_[e.winner].short} wins the round!`:`Mission failed. ${_[e.winner].short} outplayed you.`:`Mission complete. ${_[e.winner].name} wins the round!`,me(i?`Mission failed`:`Mission complete`,i?`fail`:`win`)}else k.draws++,g.draw(),$(1,x(v[1].draw)),setTimeout(()=>$(2,x(v[2].draw)),600),B.textContent=`The board is full. Stalemate.`,me(`Stalemate`,`draw`);S(`#round-info`).textContent=`Round ${D} · Draws ${k.draws}`,L.classList.add(`locked`),z.hidden=!0,V.hidden=!1,setTimeout(()=>S(`#rematch`).focus({preventScroll:!0}),400)}function me(e,t){H.textContent=e,H.className=`board-stamp show ${t}`}var he=new Map;function $(e,t){let n=S(`.bubble`,U[e]);n.textContent=t,n.classList.remove(`show`),n.offsetWidth,n.classList.add(`show`),clearTimeout(he.get(e)),he.set(e,window.setTimeout(()=>n.classList.remove(`show`),2600))}document.querySelectorAll(`.hit`).forEach(e=>{let t=Number(e.dataset.col);e.addEventListener(`click`,()=>void Z(t)),e.addEventListener(`pointerenter`,e=>{e.pointerType===`mouse`&&(j=t,X())}),e.addEventListener(`focus`,()=>{j=t,X()})}),document.addEventListener(`keydown`,e=>{if(F.hidden||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement?.classList.contains(`hit`)??!1;e.key===`ArrowLeft`||e.key===`ArrowRight`?(e.preventDefault(),j=(j+(e.key===`ArrowLeft`?6:1))%7,S(`.hit[data-col="${j}"]`).focus({preventScroll:!0}),X()):(e.key===`ArrowDown`||(e.key===`Enter`||e.key===` `)&&!t)&&V.hidden?(e.preventDefault(),Z(j)):/^[1-7]$/.test(e.key)?Z(Number(e.key)-1):e.key===`Escape`&&G()}),W();