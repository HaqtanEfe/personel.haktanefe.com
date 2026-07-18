// Personal page — Discord copy + easter eggs.
//
// Easter eggs you can find:
//   1. Open dev console — there's a greeting.
//   2. Switch to another tab — page title swaps.
//   3. Konami code (↑↑↓↓←→←→BA) — confetti rain.
//   4. Click the logo 5 times — secret toast.
//   5. Press "/" — command palette with hidden actions.

(function () {

  /* ───── 1. Console greeting ────────────────────────── */
  const banner = [
    '%c╔══════════════════════════════════╗',
    '║   hey, you opened the inspector  ║',
    '║   if you read this — say hi on   ║',
    '║   discord: HaqtanEfe             ║',
    '╚══════════════════════════════════╝',
  ].join('\n');
  console.log(banner, 'color:#fb7185;font-family:monospace;font-size:12px;');
  console.log('%cpress "/" anywhere on the page for a command palette.', 'color:#5eead4;font-style:italic;');

  /* ───── 2. Tab-away title swap ─────────────────────── */
  const originalTitle = document.title;
  const awayTitle     = '👀 come back';
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? awayTitle : originalTitle;
  });

  /* ───── Toast helper ───────────────────────────────── */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, opts = {}) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, opts.duration || 2600);
  }

  /* ───── Discord copy buttons ───────────────────────── */
  document.querySelectorAll('.js-discord').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = el.dataset.username || 'HaqtanEfe';
      try {
        await navigator.clipboard.writeText(username);
        showToast(`Discord username "${username}" copied — paste it in Discord search`);
      } catch {
        showToast(`My Discord: ${username}`);
      }
    });
  });

  /* ───── 3. Konami code → confetti ──────────────────── */
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIndex = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === konami[kIndex]) {
      kIndex++;
      if (kIndex === konami.length) {
        kIndex = 0;
        partyTime();
      }
    } else {
      // allow partial restart if the failed key is the first of the sequence
      kIndex = (k === konami[0]) ? 1 : 0;
    }
  });

  function partyTime() {
    showToast('🎉 ↑↑↓↓←→←→BA — you remembered');
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = randomAccent();
      piece.style.animationDuration = (3 + Math.random() * 2.5) + 's';
      piece.style.animationDelay = Math.random() * 0.8 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 6000);
    }
  }

  function randomAccent() {
    const colors = ['#fb7185','#5eead4','#fde047','#c4b5fd','#fdba74','#93c5fd'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /* ───── Minecraft block-break click effect ─────────── */
  const DIRT_COLORS = ['#8B6440', '#9C7448', '#7A553C', '#7BAA42', '#6B9A38', '#8BBA52'];
  document.querySelectorAll('.js-mc-click').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const count = 12 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        spawnDirt(cx, cy);
      }
    });
  });

  function spawnDirt(cx, cy) {
    const p = document.createElement('div');
    p.className = 'dirt-particle';
    p.style.background = DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)];
    p.style.left = (cx - 3.5) + 'px';
    p.style.top  = (cy - 3.5) + 'px';
    document.body.appendChild(p);

    const angle = (Math.random() - 0.5) * Math.PI;       // -90° to +90° (sideways)
    const speed = 120 + Math.random() * 140;
    const vx = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
    const vy = -180 - Math.random() * 140;               // initial upward
    const gravity = 1400;                                 // px/s^2
    const rot = (Math.random() - 0.5) * 720;
    const lifetime = 0.9 + Math.random() * 0.4;
    const start = performance.now();

    function frame(t) {
      const dt = (t - start) / 1000;
      if (dt > lifetime) { p.remove(); return; }
      const x = vx * dt;
      const y = vy * dt + 0.5 * gravity * dt * dt;
      p.style.transform = `translate(${x}px, ${y}px) rotate(${rot * dt}deg)`;
      p.style.opacity = String(1 - Math.pow(dt / lifetime, 2));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ───── 4. Logo click counter ──────────────────────── */
  const logo = document.getElementById('logo-btn');
  let logoClicks = 0;
  let logoTimer;
  if (logo) {
    logo.addEventListener('click', (e) => {
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);
      if (logoClicks === 5) {
        e.preventDefault();
        logoClicks = 0;
        showToast('🥚 you found an egg — there are more, keep poking');
      }
    });
  }

  /* ───── Discord live profile card (via Lanyard) ────
     Reads Discord presence over WebSocket from api.lanyard.rest.
     Requires the user to be a member of the Lanyard Discord server
     (discord.gg/lanyard) — otherwise INIT_STATE never arrives and
     we show a friendly fallback.
     ───────────────────────────────────────────────────── */
  const DISCORD_USER_ID = '878362276334272523';
  const dcAvatar   = document.getElementById('dc-avatar');
  const dcRing     = document.getElementById('dc-status-ring');
  const dcName     = document.getElementById('dc-name');
  const dcHandle   = document.getElementById('dc-handle');
  const dcPresence = document.getElementById('dc-presence');

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function avatarUrl(user) {
    if (!user || !user.id) return '';
    if (!user.avatar) {
      // Discord default avatar based on user id (new system)
      const idx = Number((BigInt(user.id) >> 22n) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    }
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }

  function renderEmoji(emoji) {
    if (!emoji) return '';
    if (emoji.id) {
      const ext = emoji.animated ? 'gif' : 'png';
      return `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=32" alt="${escapeHtml(emoji.name || '')}">`;
    }
    return escapeHtml(emoji.name || '');
  }

  function renderPresence(data) {
    if (!data || !data.discord_user) return;
    const user = data.discord_user;

    // Avatar + name + handle + status ring
    dcAvatar.src = avatarUrl(user);
    dcAvatar.alt = user.username || '';
    dcName.textContent = user.global_name || user.display_name || user.username || 'Discord user';
    dcHandle.textContent = '@' + (user.username || '');
    dcRing.className = 'dc-status-ring ' + (data.discord_status || 'offline');

    // Build custom status + activity blocks
    const acts = data.activities || [];
    const custom = acts.find(a => a.type === 4);
    const game   = acts.find(a => a.type === 0);
    const parts = [];

    if (custom && (custom.state || custom.emoji)) {
      const emojiHtml = custom.emoji ? `<span class="dc-emoji">${renderEmoji(custom.emoji)}</span>` : '';
      const stateText = custom.state ? `<span class="dc-state">${escapeHtml(custom.state)}</span>` : '';
      parts.push(`<div class="dc-custom">${emojiHtml}${stateText}</div>`);
    }

    if (data.listening_to_spotify && data.spotify) {
      parts.push(`
        <div class="dc-activity">
          <img class="dc-act-thumb" src="${escapeHtml(data.spotify.album_art_url || '')}" alt="">
          <div class="dc-act-info">
            <div class="dc-act-line primary">${escapeHtml(data.spotify.song || '')}</div>
            <div class="dc-act-line">${escapeHtml(data.spotify.artist || '')}</div>
          </div>
        </div>`);
    } else if (game) {
      parts.push(`
        <div class="dc-activity">
          <div class="dc-act-thumb is-emoji">🎮</div>
          <div class="dc-act-info">
            <div class="dc-act-line primary">${escapeHtml(game.name || '')}</div>
            ${game.details ? `<div class="dc-act-line">${escapeHtml(game.details)}</div>` : ''}
          </div>
        </div>`);
    }

    dcPresence.classList.remove('dc-empty');
    if (parts.length) {
      dcPresence.innerHTML = parts.join('');
    } else {
      const map = { online: 'online', idle: 'idle', dnd: 'do not disturb', offline: 'offline' };
      const word = map[data.discord_status] || 'offline';
      dcPresence.innerHTML = `<div class="dc-empty" style="margin-top:12px">${escapeHtml(word)}</div>`;
    }
  }

  function showFallback(msg) {
    if (!dcPresence) return;
    dcPresence.classList.add('dc-empty');
    dcPresence.textContent = msg;
  }

  function connectLanyard() {
    if (!dcAvatar) return;
    let heartbeat, ws, gotInit = false;
    try {
      ws = new WebSocket('wss://api.lanyard.rest/socket');
    } catch {
      showFallback('Discord unreachable');
      return;
    }

    const initTimer = setTimeout(() => {
      if (!gotInit) showFallback('join discord.gg/lanyard to show live status');
    }, 6000);

    ws.addEventListener('message', (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.op === 1) {
        heartbeat = setInterval(() => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ op: 3 }));
        }, msg.d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_USER_ID } }));
      } else if (msg.op === 0 && (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE')) {
        gotInit = true;
        clearTimeout(initTimer);
        renderPresence(msg.d);
      }
    });

    ws.addEventListener('close', () => {
      clearInterval(heartbeat);
      clearTimeout(initTimer);
      setTimeout(connectLanyard, 5000);
    });

    ws.addEventListener('error', () => showFallback('Discord unreachable'));
  }

  if (dcAvatar) connectLanyard();

  /* ───── 5. Command palette ─────────────────────────── */
  const COMMANDS = [
    { id: 'party',    label: 'Party mode',          desc: 'cycle the page colors',         hint: '🎊', run: togglePartyMode },
    { id: 'matrix',   label: 'Matrix rain',         desc: '5 seconds of green',            hint: '🟢', run: matrixRain },
    { id: 'confetti', label: 'Confetti',            desc: 'rain a quick celebration',      hint: '🎉', run: partyTime },
    { id: 'home',     label: 'Go home',             desc: 'haktanefe.com',                 hint: '→', run: () => location.href = 'https://haktanefe.com' },
    { id: 'business', label: 'Business side',       desc: 'go to commissions page',        hint: '→', run: () => location.href = 'https://haqtanefe.dev' },
    { id: 'discord',  label: 'Copy Discord',        desc: 'copies @HaqtanEfe to clipboard', hint: '⎘', run: copyDiscordCmd },
    { id: 'about',    label: 'About this page',     desc: 'who made this and how',         hint: 'ℹ', run: () => showToast('hand-written HTML/CSS/JS · no framework · made by haq with a lot of coffee', { duration: 4000 }) },
    { id: 'help',     label: 'Help',                desc: 'list commands',                 hint: '?', run: () => { input.value = ''; renderList(''); } },
  ];

  const overlay = document.getElementById('cmd-overlay');
  const input   = document.getElementById('cmd-input');
  const list    = document.getElementById('cmd-list');
  let activeIdx = 0;
  let filtered  = COMMANDS;

  function openCmd() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    renderList('');
    setTimeout(() => input.focus(), 50);
  }
  function closeCmd() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    input.blur();
  }
  function renderList(q) {
    q = q.trim().toLowerCase();
    filtered = q
      ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.id.includes(q) || c.desc.toLowerCase().includes(q))
      : COMMANDS;
    activeIdx = 0;
    list.innerHTML = filtered.map((c, i) => `
      <div class="cmd-item ${i === activeIdx ? 'is-active' : ''}" data-i="${i}">
        <div>
          <div>${c.label}</div>
          <div class="desc">${c.desc}</div>
        </div>
        <div class="kbd">${c.hint}</div>
      </div>
    `).join('');
    list.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('mouseenter', () => setActive(parseInt(el.dataset.i)));
      el.addEventListener('click', () => runActive());
    });
  }
  function setActive(i) {
    activeIdx = i;
    list.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.classList.toggle('is-active', idx === activeIdx);
    });
  }
  function runActive() {
    const cmd = filtered[activeIdx];
    if (!cmd) return;
    closeCmd();
    setTimeout(() => cmd.run(), 80);
  }

  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('is-open')) {
      if (e.key === 'Escape') { closeCmd(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((activeIdx + 1) % filtered.length); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((activeIdx - 1 + filtered.length) % filtered.length); }
      else if (e.key === 'Enter')     { e.preventDefault(); runActive(); }
      return;
    }
    // open on "/" or "?" — ignore when typing in an input
    if ((e.key === '/' || e.key === '?') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openCmd();
    }
  });
  input.addEventListener('input', () => renderList(input.value));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCmd(); });

  /* ───── Command actions ───────────────────────────── */
  function togglePartyMode() {
    document.body.classList.toggle('party-mode');
    showToast(document.body.classList.contains('party-mode') ? '🎊 party mode ON' : 'party mode OFF');
  }

  async function copyDiscordCmd() {
    try {
      await navigator.clipboard.writeText('HaqtanEfe');
      showToast('Discord username copied — @HaqtanEfe');
    } catch {
      showToast('My Discord: HaqtanEfe');
    }
  }

  function matrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:90;pointer-events:none;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    addEventListener('resize', resize);

    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(0).map(() => Math.random() * -canvas.height);
    const glyphs = '01アイウエオカキクケコサシスセソ@#%&*HAQ';
    const start = Date.now();

    function frame() {
      ctx.fillStyle = 'rgba(10,10,10,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#5eead4';
      ctx.font = '14px JetBrains Mono, monospace';
      for (let i = 0; i < cols; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * 14, drops[i]);
        drops[i] += 14;
        if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
      }
      if (Date.now() - start < 5000) {
        requestAnimationFrame(frame);
      } else {
        canvas.style.transition = 'opacity .6s';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.remove(), 700);
        removeEventListener('resize', resize);
      }
    }
    frame();
  }

})();
