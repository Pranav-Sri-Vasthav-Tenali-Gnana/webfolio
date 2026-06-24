// Secret arcade: three small games + tab switching
document.addEventListener('DOMContentLoaded', () => {
    const arcade = document.getElementById('arcade');
    if (!arcade) return;

    /* ---------- tab switching ---------- */
    const tabs = arcade.querySelectorAll('.arcade-tab');
    const games = arcade.querySelectorAll('.arcade-game');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.game;
            games.forEach(g => {
                const on = g.dataset.game === target;
                g.classList.toggle('active', on);
                g.hidden = !on;
            });
        });
    });

    /* =====================================================
       1. REACTION TEST
       ===================================================== */
    (function reactionGame() {
        const box = document.getElementById('reaction-box');
        const bestEl = document.getElementById('reaction-best');
        if (!box) return;
        let state = 'idle', greenAt = 0, timer = null;
        let best = parseInt(localStorage.getItem('reactionBest') || '0', 10);
        if (best) bestEl.textContent = best + ' ms';

        function setState(s, text) {
            state = s;
            box.dataset.state = s;
            box.textContent = text;
        }
        box.addEventListener('click', () => {
            if (state === 'idle' || state === 'result' || state === 'soon') {
                setState('waiting', 'Wait for green…');
                timer = setTimeout(() => {
                    greenAt = performance.now();
                    setState('ready', 'TAP!');
                }, 1200 + Math.random() * 2200);
            } else if (state === 'waiting') {
                clearTimeout(timer);
                setState('soon', 'Too soon! Click to retry');
            } else if (state === 'ready') {
                const ms = Math.round(performance.now() - greenAt);
                setState('result', ms + ' ms — click to retry');
                if (!best || ms < best) {
                    best = ms;
                    localStorage.setItem('reactionBest', best);
                    bestEl.textContent = best + ' ms';
                }
            }
        });
    })();

    /* =====================================================
       2. MEMORY MATCH
       ===================================================== */
    (function memoryGame() {
        const grid = document.getElementById('memory-grid');
        const movesEl = document.getElementById('memory-moves');
        const winEl = document.getElementById('memory-win');
        const restart = document.getElementById('memory-restart');
        if (!grid) return;
        const FACES = ['🚀', '🎧', '🍕', '🐙', '🎲', '🌵', '⚡', '🎯'];
        let first = null, lock = false, moves = 0, matched = 0;

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function build() {
            grid.innerHTML = '';
            first = null; lock = false; moves = 0; matched = 0;
            movesEl.textContent = '0';
            winEl.hidden = true;
            const deck = shuffle(FACES.concat(FACES));
            deck.forEach(face => {
                const card = document.createElement('button');
                card.className = 'memory-card';
                card.dataset.face = face;
                card.innerHTML = '<span class="mc-back">❓</span><span class="mc-face">' + face + '</span>';
                card.addEventListener('click', () => flip(card));
                grid.appendChild(card);
            });
        }

        function flip(card) {
            if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            card.classList.add('flipped');
            if (!first) { first = card; return; }
            moves++;
            movesEl.textContent = moves;
            if (first.dataset.face === card.dataset.face) {
                first.classList.add('matched');
                card.classList.add('matched');
                first = null;
                matched += 2;
                if (matched === FACES.length * 2) winEl.hidden = false;
            } else {
                lock = true;
                const a = first, b = card; first = null;
                setTimeout(() => {
                    a.classList.remove('flipped');
                    b.classList.remove('flipped');
                    lock = false;
                }, 700);
            }
        }

        restart.addEventListener('click', build);
        build();
    })();

    /* =====================================================
       3. TIC-TAC-TOE (vs simple AI)
       ===================================================== */
    (function tttGame() {
        const board = document.getElementById('ttt-board');
        const status = document.getElementById('ttt-status');
        const restart = document.getElementById('ttt-restart');
        if (!board) return;
        const WINS = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        let cells = [], over = false;

        function winner(b) {
            for (const [a, c, d] of WINS) {
                if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
            }
            return null;
        }

        function build() {
            board.innerHTML = '';
            cells = Array(9).fill('');
            over = false;
            status.textContent = 'Your move';
            for (let i = 0; i < 9; i++) {
                const c = document.createElement('button');
                c.className = 'ttt-cell';
                c.addEventListener('click', () => play(i));
                board.appendChild(c);
            }
        }

        function render() {
            [...board.children].forEach((c, i) => {
                c.textContent = cells[i];
                c.classList.toggle('x', cells[i] === 'X');
                c.classList.toggle('o', cells[i] === 'O');
            });
        }

        function emptyCells(b) { return b.map((v, i) => v ? -1 : i).filter(i => i >= 0); }

        function aiMove() {
            // win if possible, else block, else center, else random
            const tryMark = (mark) => {
                for (const i of emptyCells(cells)) {
                    const copy = cells.slice(); copy[i] = mark;
                    if (winner(copy) === mark) return i;
                }
                return -1;
            };
            let move = tryMark('O');
            if (move < 0) move = tryMark('X');
            if (move < 0 && !cells[4]) move = 4;
            if (move < 0) {
                const opts = emptyCells(cells);
                move = opts[Math.floor(Math.random() * opts.length)];
            }
            cells[move] = 'O';
        }

        function finish() {
            const w = winner(cells);
            if (w) {
                over = true;
                status.textContent = w === 'X' ? 'You win! 🎉' : 'Computer wins 🤖';
                return true;
            }
            if (emptyCells(cells).length === 0) {
                over = true;
                status.textContent = "It's a draw 🤝";
                return true;
            }
            return false;
        }

        function play(i) {
            if (over || cells[i]) return;
            cells[i] = 'X';
            render();
            if (finish()) return;
            status.textContent = 'Computer thinking…';
            setTimeout(() => {
                aiMove();
                render();
                if (!finish()) status.textContent = 'Your move';
            }, 350);
        }

        restart.addEventListener('click', build);
        build();
    })();
});
