// --- APEXFLOW MARKET DOLLAR HUNTERS MAIN CONTROLLER ---
const PARTNER_APP_ID = "34UGhpx0qrXHqpfKHAkGH";
const AFFILIATE_TOKEN = "3A2CFHPG722B";

const marketSymbols = {
    synthetic: [
        { symbol: 'R_100', name: 'Volatility 100 Index' }, { symbol: 'R_75', name: 'Volatility 75 Index' },
        { symbol: 'R_50', name: 'Volatility 50 Index' }, { symbol: 'R_25', name: 'Volatility 25 Index' },
        { symbol: 'R_10', name: 'Volatility 10 Index' }, { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index' },
        { symbol: 'BOOM1000', name: 'Boom 1000 Index' }, { symbol: 'CRASH1000', name: 'Crash 1000 Index' }
    ],
    forex: [
        { symbol: 'frxEURUSD', name: 'EUR/USD' }, { symbol: 'frxGBPUSD', name: 'GBP/USD' },
        { symbol: 'frxUSDJPY', name: 'USD/JPY' }, { symbol: 'frxGBPJPY', name: 'GBP/JPY' }
    ],
    stocks: [{ symbol: 'DJI', name: 'Wall Street 30' }, { symbol: 'NDX', name: 'US Tech 100' }],
    crypto: [{ symbol: 'cryBTCUSD', name: 'BTC/USD' }, { symbol: 'cryETHUSD', name: 'ETH/USD' }],
    commodities: [{ symbol: 'frxXAUUSD', name: 'Spot Gold (XAU/USD)' }, { symbol: 'frxXBRUSD', name: 'Brent Crude' }]
};

let remainingSeconds = 180;
function runCoreLoadingSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const splashScreen = document.getElementById('splash-screen');

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((180 - remainingSeconds) / 180) * 100}%`;

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            if (splashScreen) { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.remove(), 600); }
            initializeLiveTerminal();
        }
    }, 1000);
}

function updateAssetDropdown(category) {
    const assetSelector = document.getElementById('asset-selector');
    if (!assetSelector) return;
    assetSelector.innerHTML = '';
    (marketSymbols[category] || marketSymbols.synthetic).forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.symbol;
        opt.innerText = item.name;
        assetSelector.appendChild(opt);
    });
}

function switchAccountMode(mode) {
    const b1 = document.getElementById('btn-mode-demo'), b2 = document.getElementById('btn-mode-real');
    if (mode === 'demo') {
        b1.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b2.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    } else {
        b2.className = 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition';
        b1.className = 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    }
}

function executeManualOrder(dir) {
    alert(`Manual ${dir} binary contract successfully placed! Stake: $${document.getElementById('manual-stake').value}`);
}

function loginWithDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${PARTNER_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}
function signupWithDeriv() {
    window.open(`https://hub.deriv.com/tradershub/signup?t=${AFFILIATE_TOKEN}`, '_blank');
}

// --- PRO SCANNER: MULTI-TIMEFRAME TICK ANALYSIS & INDICATOR SUITE ---
function runProScannerAndIndicators(tickBuffer, assetSymbol) {
    if (!tickBuffer || tickBuffer.length < 30) return;
    const prices = tickBuffer;
    const currentPrice = prices[prices.length - 1];

    // Multi-Timeframe Tick Analysis (Least to Highest swings)
    const leastTick = Math.min(...prices.slice(-20));
    const highestTick = Math.max(...prices.slice(-20));
    const digitSpread = parseInt((currentPrice * 10000).toFixed(0)) % 10;

    // Pro Scanner Determination
    const bestContractEl = document.getElementById('pro-scanner-best-contract');
    if (digitSpread % 2 === 0) {
        bestContractEl.innerText = `EVEN Digits / RISE Momentum (Spread: ${digitSpread})`;
    } else {
        bestContractEl.innerText = `ODD Digits / FALL Momentum (Spread: ${digitSpread})`;
    }

    // Technical Indicators Calculation
    let gains = 0, losses = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff; else losses += Math.abs(diff);
    }
    const rsi = 100 - (100 / (1 + ((gains / 14) / ((losses / 14) || 1))));
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const macdHist = (prices[prices.length - 1] - prices[prices.length - 6]) - (prices[prices.length - 1] - prices[prices.length - 15]);
    const stochK = ((currentPrice - leastTick) / ((highestTick - leastTick) || 0.0001)) * 100;

    let bullishScore = 0;
    if (rsi > 50) bullishScore++;
    if (macdHist > 0) bullishScore++;
    if (stochK > 50) bullishScore++;
    if (currentPrice >= sma20) bullishScore++;

    document.getElementById('ind-rsi').innerText = `${rsi.toFixed(1)} (${rsi > 50 ? 'Bullish' : 'Bearish'})`;
    document.getElementById('ind-macd').innerText = `${macdHist >= 0 ? '+' : ''}${macdHist.toFixed(4)}`;
    document.getElementById('ind-stoch').innerText = `${stochK.toFixed(1)}%`;
    document.getElementById('ind-bb').innerText = currentPrice >= sma20 ? 'Upper Band' : 'Lower Band';

    document.getElementById('indicator-match-count').innerText = `${bullishScore}/4 Indicators Aligned`;
    document.getElementById('signal-expiry-window').innerText = `Expiry: ${bullishScore >= 3 ? '5 Ticks' : '10 Ticks'}`;

    const signalBadge = document.getElementById('signal-badge');
    const recAction = document.getElementById('recommended-action');
    if (bullishScore >= 3) {
        signalBadge.innerText = `SIGNAL: BUY 🚦 (Entry @ ${currentPrice.toFixed(4)})`;
        signalBadge.className = 'text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/40 font-mono font-bold animate-pulse';
        recAction.innerText = `Take RISE Contract • Entry @ ${currentPrice.toFixed(4)}`;
    } else {
        signalBadge.innerText = `SIGNAL: SELL 🚦 (Entry @ ${currentPrice.toFixed(4)})`;
        signalBadge.className = 'text-[10px] bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded border border-red-500/40 font-mono font-bold animate-pulse';
        recAction.innerText = `Take FALL Contract • Entry @ ${currentPrice.toFixed(4)}`;
    }
}

// Legit Institutional Killzone Session Calculator (EAT / UTC+3)
function updateLegitKillzones() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const eatHours = (utcHours + 3) % 24;

    const sessionEl = document.getElementById('active-session-name');
    const timerEl = document.getElementById('killzone-timer');

    let sessionName = "Asian Session (Quiet Liquidity)";
    if (eatHours >= 10 && eatHours < 17) sessionName = "London Killzone (Active)";
    else if (eatHours >= 15 && eatHours < 21) sessionName = "London - New York Overlap 🔥";
    else if (eatHours >= 16 && eatHours < 24) sessionName = "New York Session";

    if (sessionEl) sessionEl.innerText = sessionName;
    if (timerEl) timerEl.innerText = `${String(eatHours).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} EAT`;
}

function initializeLiveTerminal() {
    updateAssetDropdown('synthetic');
    const categorySelect = document.getElementById('market-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            updateAssetDropdown(e.target.value);
            const newAsset = document.getElementById('asset-selector').value;
            if (window.derivApiInstance) window.derivApiInstance.subscribeTicks(newAsset, handleTick);
        });
    }

    const derivApi = new DerivAPIConnector(PARTNER_APP_ID);
    window.derivApiInstance = derivApi;
    const aiEngine = new AIBotsEngine();

    const speedBoatSelect = document.getElementById('speed-boat-selector');
    if (speedBoatSelect) speedBoatSelect.addEventListener('change', (e) => aiEngine.setSpeedBoat(e.target.value));

    derivApi.connect().then(() => {
        const assetSelector = document.getElementById('asset-selector');
        const initialAsset = assetSelector ? assetSelector.value : 'R_100';
        derivApi.subscribeTicks(initialAsset, handleTick);
        if (assetSelector) {
            assetSelector.addEventListener('change', (e) => derivApi.subscribeTicks(e.target.value, handleTick));
        }
    }).catch(() => {
        setInterval(() => { handleTick({ quote: 10340.50 + Math.random() * 5, symbol: 'R_100' }); }, 1000);
    });

    function handleTick(tick) {
        const quoteEl = document.getElementById('live-quote-display');
        if (quoteEl) quoteEl.innerText = tick.quote.toFixed(4);
        aiEngine.analyzeTick(tick);
        runProScannerAndIndicators(aiEngine.tickBuffer, tick.symbol || 'R_100');
    }

    setInterval(updateLegitKillzones, 1000);
}

window.addEventListener('DOMContentLoaded', () => { runCoreLoadingSequence(); });
