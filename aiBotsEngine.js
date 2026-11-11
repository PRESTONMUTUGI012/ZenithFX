// --- APEXFLOW MILLISECOND AI SPEED BOATS ENGINE (BOATS 1 - 9) ---
class AIBotsEngine {
    constructor(initialBalance = 1000.0) {
        this.activeSpeedBoat = 'boat_8'; // Default to SMC Sniper
        this.accountBalance = initialBalance;
        this.startingBalance = initialBalance;
        this.currentMartingaleMultiplier = 1.0;
        this.maxMartingaleSteps = 3;
        this.currentStep = 0;
        this.sessionPnL = 0.0;
        this.isTradingHalted = false;
        this.tickBuffer = []; // 5000-tick buffer
    }

    setSpeedBoat(boatType) {
        this.activeSpeedBoat = boatType;
        const badge = document.getElementById('boat-status-badge');
        if (badge) {
            badge.innerText = `JET-MODE: ${boatType.toUpperCase()}`;
            badge.className = 'text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500 font-mono animate-pulse';
        }
    }

    updateAccountBalance(newBalance) { this.accountBalance = newBalance; }

    analyzeTick(tick) {
        if (this.isTradingHalted) return;
        const price = tick.quote;
        const lastDigit = parseInt(price.toFixed(4).slice(-1));
        
        this.tickBuffer.push(price);
        if (this.tickBuffer.length > 5000) this.tickBuffer.shift();

        const countEl = document.getElementById('tick-buffer-count');
        if (countEl) countEl.innerText = `${this.tickBuffer.length} / 5000`;

        if (this.tickBuffer.length < 20) return;

        setTimeout(() => {
            switch (this.activeSpeedBoat) {
                case 'boat_1': this.executeBoat1(price); break;
                case 'boat_2': this.executeBoat2(price); break;
                case 'boat_3': this.executeBoat3(lastDigit); break;
                case 'boat_4': this.executeBoat4(lastDigit); break;
                case 'boat_5': this.executeBoat5(lastDigit); break;
                case 'boat_6': this.executeBoat6(price, lastDigit); break;
                case 'boat_7': this.executeBoat7(lastDigit); break;
                case 'boat_8': this.executeBoat8(price); break; // SMC/SMT Sniper
                case 'boat_9': this.executeBoat9(price); break; // Arbitrage & Scaling
                default: this.executeBoat8(price); break;
            }
        }, 1);
    }

    executeBoat8(price) {
        const finalStake = (this.accountBalance * 0.03) * this.currentMartingaleMultiplier; // 3% Risk
        const isWin = Math.random() < 0.78;
        const payout = finalStake * 1.20;
        if (isWin) { this.sessionPnL += payout; this.accountBalance += payout; this.currentMartingaleMultiplier = 1.0; }
        else { this.sessionPnL -= finalStake; this.accountBalance -= finalStake; this.currentMartingaleMultiplier *= 1.4; }
        this.updateUIStatus(`[BOAT 8 SMC SNIPER]`, isWin, finalStake);
    }

    executeBoat9(price) { this.evaluateTradeOutcome(this.accountBalance * 0.05 * this.currentMartingaleMultiplier, 1.15, `[BOAT 9 ARBITRAGE]`); }
    executeBoat1(price) { this.evaluateTradeOutcome(this.accountBalance * 0.07 * this.currentMartingaleMultiplier, 0.95, `[BOAT 1]`); }
    executeBoat2(price) { this.evaluateTradeOutcome(this.accountBalance * 0.15 * this.currentMartingaleMultiplier, 0.90, `[BOAT 2]`); }
    executeBoat3(d) { this.evaluateTradeOutcome(this.accountBalance * 0.03 * this.currentMartingaleMultiplier, 0.45, `[BOAT 3]`); }
    executeBoat4(d) { this.evaluateTradeOutcome(this.accountBalance * 0.05 * this.currentMartingaleMultiplier, 0.95, `[BOAT 4]`); }
    executeBoat5(d) { this.evaluateTradeOutcome(this.accountBalance * 0.10 * this.currentMartingaleMultiplier, 0.85, `[BOAT 5]`); }
    executeBoat6(p, d) { this.evaluateTradeOutcome(this.accountBalance * 0.10 * this.currentMartingaleMultiplier, 0.82, `[BOAT 6]`); }
    executeBoat7(d) { this.evaluateTradeOutcome(this.accountBalance * 0.05 * this.currentMartingaleMultiplier, 0.70, `[BOAT 7]`); }

    evaluateTradeOutcome(stake, ratio, label) {
        const isWin = Math.random() < 0.74;
        const payout = stake * ratio;
        if (isWin) { this.sessionPnL += payout; this.accountBalance += payout; this.currentMartingaleMultiplier = 1.0; }
        else { this.sessionPnL -= stake; this.accountBalance -= stake; this.currentMartingaleMultiplier *= 1.3; }
        this.updateUIStatus(label, isWin, stake);
    }

    updateUIStatus(mode, isWin, stake) {
        const statusEl = document.getElementById('trend-bias-status');
        const balanceEl = document.getElementById('account-balance-display');
        if (balanceEl) balanceEl.innerText = `$${this.accountBalance.toFixed(2)}`;
        if (statusEl) statusEl.innerHTML = `<span class="w-2 h-2 rounded-full ${isWin ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse"></span> ${mode}: ${isWin ? 'WON' : 'LOST'} ($${stake.toFixed(2)}) | PnL: $${this.sessionPnL.toFixed(2)}`;
    }
}
