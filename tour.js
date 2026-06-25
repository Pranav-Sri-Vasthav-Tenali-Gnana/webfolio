// Intro modes: Reader (clean scroll) vs Unlock (play to reveal sections).
// Reaching the end in either mode unlocks the secret Arcade.
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('intro-modal');
    const panel = document.getElementById('tour-game');
    if (!modal || !panel) return;

    const btnRead = document.getElementById('intro-read');
    const btnUnlock = document.getElementById('intro-unlock');
    const btnExit = document.getElementById('tour-exit');
    const tourSkip = document.getElementById('tour-skip');

    const hint = document.getElementById('break-hint');
    const hintClose = document.getElementById('break-hint-close');
    const breakModal = document.getElementById('break-modal');
    const breakOpen = document.getElementById('break-open');
    const breakLater = document.getElementById('break-later');

    // Sections gated in unlock mode (hero is always free). Order matters.
    const SECTIONS = [
        { id: 'about', label: 'About & Skills' },
        { id: 'experience', label: 'Experience & Education' },
        { id: 'projects', label: 'Projects' },
        { id: 'contact', label: 'Contact' }
    ];
    const PER_UNLOCK = 5; // points needed per section
    let mode = null;        // 'read' | 'unlock'
    let arcadeUnlocked = false;

    /* ---------- modal helpers (forced reflow so transitions fire) ---------- */
    function open(el) { el.hidden = false; void el.offsetWidth; el.classList.add('show'); }
    function close(el) { el.classList.remove('show'); setTimeout(() => { el.hidden = true; }, 350); }

    setTimeout(() => open(modal), 1800);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hidden) { close(modal); startReader(); }
    });

    btnRead.addEventListener('click', () => { close(modal); startReader(); });
    btnUnlock.addEventListener('click', () => { close(modal); startUnlock(); });

    /* ---------- hint ---------- */
    function showHint() {
        if (!hint) return;
        hint.hidden = false;
        void hint.offsetWidth;
        hint.classList.add('show');
    }
    if (hintClose) hintClose.addEventListener('click', () => {
        hint.classList.remove('show');
        setTimeout(() => { hint.hidden = true; }, 300);
    });

    /* ---------- nav lock helpers ---------- */
    function navLinksFor(id) {
        return document.querySelectorAll('.nav-link[href="#' + id + '"]');
    }
    function lockNav(id) { navLinksFor(id).forEach(a => a.classList.add('nav-locked')); }
    function unlockNav(id) { navLinksFor(id).forEach(a => a.classList.remove('nav-locked')); }

    // intercept clicks on locked nav links
    document.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', e => {
            if (a.classList.contains('nav-locked')) { e.preventDefault(); e.stopPropagation(); }
        });
    });

    /* ---------- section lock overlay ---------- */
    function lockSection(sec) {
        const el = document.getElementById(sec.id);
        if (!el || el.querySelector('.lock-overlay')) return;
        el.classList.add('locked-section');
        const ov = document.createElement('div');
        ov.className = 'lock-overlay';
        ov.innerHTML =
            '<i class="fas fa-lock"></i>' +
            '<p>“' + sec.label + '” is locked</p>' +
            '<span>Score 5 in the mini-game to unlock the next section</span>' +
            '<button class="unlock-play-btn"><i class="fas fa-gamepad"></i> Play to unlock</button>';
        ov.querySelector('.unlock-play-btn').addEventListener('click', showGame);
        el.appendChild(ov);
        lockNav(sec.id);
    }
    function unlockSection(sec) {
        const el = document.getElementById(sec.id);
        if (!el) return;
        const ov = el.querySelector('.lock-overlay');
        if (ov) { ov.classList.add('cleared'); setTimeout(() => ov.remove(), 450); }
        el.classList.remove('locked-section');
        unlockNav(sec.id);
    }

    /* ---------- completion -> reveal arcade ---------- */
    // Once the end is reached, wait 3s before popping the arcade.
    let breakScheduled = false;
    function scheduleBreak() {
        if (breakScheduled || arcadeUnlocked) return;
        breakScheduled = true;
        setTimeout(unlockArcade, 1500);
    }
    function unlockArcade() {
        if (arcadeUnlocked) return;
        arcadeUnlocked = true;
        if (hint && !hint.hidden) { hint.classList.remove('show'); setTimeout(() => hint.hidden = true, 300); }
        open(breakModal);
    }
    // "Maybe later" just dismisses — the arcade stays out of the nav.
    breakLater.addEventListener('click', () => close(breakModal));
    // The arcade (and its nav link) only appear when they choose to open it.
    breakOpen.addEventListener('click', () => {
        close(breakModal);
        document.querySelectorAll('.nav-arcade').forEach(a => { a.hidden = false; });
        const arc = document.getElementById('arcade');
        arc.hidden = false;
        arc.classList.add('visible');
        setTimeout(() => {
            const y = arc.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo(0, y);
        }, 120);
    });

    /* =====================================================
       READER MODE
       ===================================================== */
    // Fire unlockArcade once the visitor scrolls (almost) to the bottom.
    let endWatchStarted = false;
    function watchForEnd() {
        if (endWatchStarted) return;
        endWatchStarted = true;
        function onScroll() {
            const reached = window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 160;
            if (reached) {
                window.removeEventListener('scroll', onScroll);
                scheduleBreak();
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // handle very short pages immediately
    }

    function startReader() {
        if (mode) return;
        mode = 'read';
        showHint();
        watchForEnd();
    }

    /* =====================================================
       UNLOCK MODE
       ===================================================== */
    let unlockedCount = 0;
    const labelEl = document.getElementById('tour-label');
    const barEl = document.getElementById('unlock-bar');
    const textEl = document.getElementById('unlock-text');

    function refreshUnlockUI() {
        if (unlockedCount >= SECTIONS.length) {
            labelEl.textContent = 'All unlocked!';
            barEl.style.width = '100%';
            textEl.textContent = 'Everything is open — keep playing or read on 🎉';
            return;
        }
        const next = SECTIONS[unlockedCount];
        const into = score - unlockedCount * PER_UNLOCK; // points into current section
        const remaining = PER_UNLOCK - into;
        labelEl.textContent = 'Catch fruit to unlock';
        barEl.style.width = (into / PER_UNLOCK * 100) + '%';
        textEl.textContent = 'Next: ' + next.label + ' — ' + remaining + ' to go';
    }

    function startUnlock() {
        if (mode) return;
        mode = 'unlock';
        showHint();
        SECTIONS.forEach(lockSection);
        refreshUnlockUI();
        // The game stays hidden until the visitor clicks "Play to unlock".
    }

    // Show the game on top of the page; continue from the current score.
    let gameInited = false;
    function showGame() {
        if (unlockedCount >= SECTIONS.length) return; // nothing left to unlock
        open(panel);
        if (!gameInited) { gameInited = true; startKidGame(); }
        else { clearInterval(loop); loop = setInterval(tick, 200); draw(); }
    }
    function hideGame() {
        stopKidGame();
        close(panel);
    }
    btnExit.addEventListener('click', hideGame);

    // "skip the game" — reveal everything and fall back to reader behaviour
    if (tourSkip) tourSkip.addEventListener('click', () => {
        hideGame();
        SECTIONS.forEach((s, i) => { if (i >= unlockedCount) unlockSection(s); });
        unlockedCount = SECTIONS.length;
        watchForEnd();
    });

    function onScore() {
        // unlock any sections whose threshold we've now crossed
        let lastUnlocked = null;
        while (unlockedCount < SECTIONS.length && score >= (unlockedCount + 1) * PER_UNLOCK) {
            lastUnlocked = SECTIONS[unlockedCount];
            unlockSection(lastUnlocked);
            unlockedCount++;
        }
        refreshUnlockUI();
        if (lastUnlocked) {
            // hide the game so they can read the freshly unlocked section
            hideGame();
            const el = document.getElementById(lastUnlocked.id);
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            setTimeout(() => window.scrollTo({ top: y, behavior: 'auto' }), 360);
        }
        if (unlockedCount >= SECTIONS.length) scheduleBreak();
    }

    /* =====================================================
       KID + FRUIT MINI-GAME (snake movement, no growth, wraps)
       ===================================================== */
    const canvas = document.getElementById('kid-canvas');
    const ctx = canvas.getContext('2d');
    const COLS = 10, ROWS = 6;
    const CW = canvas.width / COLS, CH = canvas.height / ROWS;
    const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍒', '🥝']; // peach removed

    const scoreEl = document.getElementById('tour-score');
    let kid, dir, nextDir, fruit, fruitChar, score = 0, loop;

    function placeFruit() {
        let f;
        do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
        while (f.x === kid.x && f.y === kid.y);
        fruit = f;
        fruitChar = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    }
    function setDir(x, y) { nextDir = { x, y }; }

    function tick() {
        dir = nextDir;
        kid.x = (kid.x + dir.x + COLS) % COLS;
        kid.y = (kid.y + dir.y + ROWS) % ROWS;
        if (kid.x === fruit.x && kid.y === fruit.y) {
            score++;
            scoreEl.textContent = score;
            placeFruit();
            onScore();
        }
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0,255,163,0.06)';
        ctx.lineWidth = 1;
        for (let i = 1; i < COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CW, 0); ctx.lineTo(i * CW, canvas.height); ctx.stroke(); }
        for (let j = 1; j < ROWS; j++) { ctx.beginPath(); ctx.moveTo(0, j * CH); ctx.lineTo(canvas.width, j * CH); ctx.stroke(); }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '20px serif';
        ctx.shadowColor = 'rgba(255,0,255,0.7)';
        ctx.shadowBlur = 12;
        ctx.fillText(fruitChar, fruit.x * CW + CW / 2, fruit.y * CH + CH / 2 + 1);
        ctx.shadowColor = 'rgba(0,255,163,0.8)';
        ctx.shadowBlur = 10;
        ctx.font = '22px serif';
        ctx.fillText('🧒', kid.x * CW + CW / 2, kid.y * CH + CH / 2 + 1);
        ctx.shadowBlur = 0;
    }

    function startKidGame() {
        kid = { x: 4, y: 3 };
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        placeFruit();
        draw();
        clearInterval(loop);
        loop = setInterval(tick, 200);
    }
    function stopKidGame() { clearInterval(loop); }

    const keymap = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
    };
    window.addEventListener('keydown', e => {
        if (!panel.hidden && keymap[e.key]) { e.preventDefault(); setDir(keymap[e.key][0], keymap[e.key][1]); }
    });
    const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    panel.querySelectorAll('.tour-dpad button').forEach(b => {
        b.addEventListener('click', () => { const m = dirs[b.dataset.dir]; if (m) setDir(m[0], m[1]); });
    });
    let sx = null, sy = null;
    canvas.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    canvas.addEventListener('touchmove', e => {
        if (sx === null) return;
        const t = e.touches[0]; const dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) < 20) return;
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
        sx = null; sy = null; e.preventDefault();
    }, { passive: false });
});
