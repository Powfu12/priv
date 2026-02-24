(function() {
    // ===== Inject CSS =====
    var style = document.createElement('style');
    style.textContent = '\
        .purchase-toast {\
            position: fixed;\
            bottom: 1.5rem;\
            left: 1.5rem;\
            z-index: 9999;\
            display: flex;\
            align-items: center;\
            gap: 0.75rem;\
            padding: 0.85rem 1.25rem;\
            background: #1a1a2e;\
            border: 1px solid rgba(255,255,255,0.08);\
            border-radius: 14px;\
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);\
            max-width: 340px;\
            transform: translateX(-120%);\
            opacity: 0;\
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);\
            pointer-events: none;\
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
        }\
        .purchase-toast.show {\
            transform: translateX(0);\
            opacity: 1;\
        }\
        .purchase-toast-icon {\
            flex-shrink: 0;\
            width: 36px;\
            height: 36px;\
            display: flex;\
            align-items: center;\
            justify-content: center;\
            background: rgba(16, 185, 129, 0.15);\
            border-radius: 50%;\
            font-size: 1.1rem;\
        }\
        .purchase-toast-text {\
            font-size: 0.8rem;\
            color: #a0a0b8;\
            line-height: 1.4;\
        }\
        .purchase-toast-text strong {\
            color: #fff;\
            font-weight: 700;\
        }\
        .purchase-toast-text .toast-country {\
            color: #f0c040;\
            font-weight: 600;\
        }\
        .purchase-toast-time {\
            font-size: 0.7rem;\
            color: #666;\
            margin-top: 0.15rem;\
        }\
        @media (max-width: 480px) {\
            .purchase-toast {\
                left: 0.75rem;\
                right: 0.75rem;\
                max-width: none;\
                bottom: 1rem;\
            }\
        }\
    ';
    document.head.appendChild(style);

    // ===== Inject HTML =====
    var toast = document.createElement('div');
    toast.className = 'purchase-toast';
    toast.id = 'purchaseToast';
    toast.innerHTML = '<div class="purchase-toast-icon">\uD83D\uDED2</div><div><div class="purchase-toast-text" id="purchaseToastText"></div><div class="purchase-toast-time" id="purchaseToastTime"></div></div>';
    document.body.appendChild(toast);

    // ===== Data =====
    var buyers = [
        { name: 'Alexandros', country: 'Greece', flag: '\uD83C\uDDEC\uD83C\uDDF7' },
        { name: 'Maria', country: 'Greece', flag: '\uD83C\uDDEC\uD83C\uDDF7' },
        { name: 'Nikos', country: 'Greece', flag: '\uD83C\uDDEC\uD83C\uDDF7' },
        { name: 'Andrei', country: 'Romania', flag: '\uD83C\uDDF7\uD83C\uDDF4' },
        { name: 'Elena', country: 'Romania', flag: '\uD83C\uDDF7\uD83C\uDDF4' },
        { name: 'Mihai', country: 'Romania', flag: '\uD83C\uDDF7\uD83C\uDDF4' },
        { name: 'Lukas', country: 'Germany', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
        { name: 'Anna', country: 'Germany', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
        { name: 'Maximilian', country: 'Germany', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
        { name: 'Pierre', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
        { name: 'Camille', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
        { name: 'Hugo', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
        { name: 'Marco', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
        { name: 'Giulia', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
        { name: 'Luca', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
        { name: 'Carlos', country: 'Spain', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
        { name: 'Sofia', country: 'Spain', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
        { name: 'Pablo', country: 'Spain', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
        { name: 'Jan', country: 'Netherlands', flag: '\uD83C\uDDF3\uD83C\uDDF1' },
        { name: 'Emma', country: 'Netherlands', flag: '\uD83C\uDDF3\uD83C\uDDF1' },
        { name: 'Daan', country: 'Netherlands', flag: '\uD83C\uDDF3\uD83C\uDDF1' },
        { name: 'Lars', country: 'Sweden', flag: '\uD83C\uDDF8\uD83C\uDDEA' },
        { name: 'Astrid', country: 'Sweden', flag: '\uD83C\uDDF8\uD83C\uDDEA' },
        { name: 'Jakub', country: 'Poland', flag: '\uD83C\uDDF5\uD83C\uDDF1' },
        { name: 'Katarzyna', country: 'Poland', flag: '\uD83C\uDDF5\uD83C\uDDF1' },
        { name: 'Tom\u00e1\u0161', country: 'Czech Republic', flag: '\uD83C\uDDE8\uD83C\uDDFF' },
        { name: 'Viktor', country: 'Hungary', flag: '\uD83C\uDDED\uD83C\uDDFA' },
        { name: 'Jonas', country: 'Lithuania', flag: '\uD83C\uDDF1\uD83C\uDDF9' },
        { name: 'Matej', country: 'Croatia', flag: '\uD83C\uDDED\uD83C\uDDF7' },
        { name: 'Diogo', country: 'Portugal', flag: '\uD83C\uDDF5\uD83C\uDDF9' },
        { name: 'Beatriz', country: 'Portugal', flag: '\uD83C\uDDF5\uD83C\uDDF9' },
        { name: 'Oliver', country: 'Denmark', flag: '\uD83C\uDDE9\uD83C\uDDF0' },
        { name: 'Felix', country: 'Austria', flag: '\uD83C\uDDE6\uD83C\uDDF9' },
        { name: 'Youssef', country: 'Belgium', flag: '\uD83C\uDDE7\uD83C\uDDEA' },
        { name: 'Eoin', country: 'Ireland', flag: '\uD83C\uDDEE\uD83C\uDDEA' },
        { name: 'Dimitris', country: 'Cyprus', flag: '\uD83C\uDDE8\uD83C\uDDFE' },
        { name: 'Ivan', country: 'Bulgaria', flag: '\uD83C\uDDE7\uD83C\uDDEC' },
        { name: 'Matti', country: 'Finland', flag: '\uD83C\uDDEB\uD83C\uDDEE' },
        { name: 'Emil', country: 'Norway', flag: '\uD83C\uDDF3\uD83C\uDDF4' },
        { name: 'Liam', country: 'Switzerland', flag: '\uD83C\uDDE8\uD83C\uDDED' }
    ];
    var timeAgo = ['just now', '1 min ago', '2 mins ago', '3 mins ago', '5 mins ago', '8 mins ago', '12 mins ago'];
    var lastBuyerIndex = -1;

    function getRandomBuyer() {
        var idx;
        do { idx = Math.floor(Math.random() * buyers.length); } while (idx === lastBuyerIndex);
        lastBuyerIndex = idx;
        return buyers[idx];
    }

    function showPurchaseToast() {
        var buyer = getRandomBuyer();
        var time = timeAgo[Math.floor(Math.random() * timeAgo.length)];
        var textEl = document.getElementById('purchaseToastText');
        var timeEl = document.getElementById('purchaseToastTime');
        var toastEl = document.getElementById('purchaseToast');
        textEl.innerHTML = '<strong>' + buyer.name + '</strong> from <span class="toast-country">' + buyer.flag + ' ' + buyer.country + '</span> just purchased';
        timeEl.textContent = time;
        toastEl.classList.add('show');
        setTimeout(function() {
            toastEl.classList.remove('show');
        }, 3500);
    }

    // First notification after 2 seconds, then every 5-8 seconds
    setTimeout(function() {
        showPurchaseToast();
        setInterval(function() {
            var delay = Math.floor(Math.random() * 3000) + 2000;
            setTimeout(showPurchaseToast, delay);
        }, 7000);
    }, 2000);
})();
