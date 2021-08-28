import { SplitConfig } from './split_config.js';
import { Game } from './modules/game.js';

var el = document.getElementById("pacman");
var PACMAN = new Game(el);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var treatments = [];
var attributes = {};
for (const [paramName, paramValue] of urlParams) {
    if (paramName === 'key') {
        SplitConfig.core.key = paramValue;
    } else if (paramName === 'treatments') {
        paramValue.split(',').forEach(function (treatment) {
            treatments.push(treatment);
        })
    } else {
        attributes[paramName] = paramValue;
    }
}

if (!SplitConfig.core.key) {
    SplitConfig.core.key = 'ANONYMOUS';
}

if (!treatments.length) {
    treatments.push('PacMan_RadarGhost');
}

var splitClient = splitio(SplitConfig).client();

function handleTreatments() {
    var treatmentsResult = splitClient.getTreatments(treatments, attributes);
    el.dispatchEvent(
        new CustomEvent('splitChange', { detail: treatmentsResult })
    );
}

splitClient.on(splitClient.Event.SDK_READY, function () {
    handleTreatments();
    console.log('Split is ready!');
});

splitClient.on(splitClient.Event.SDK_UPDATE, function () {
    handleTreatments();
    console.log('The SDK has been updated!');
});

el.addEventListener('lifeLost', function(e) {
    splitClient.track('user', 'PacMan_TTL', e.detail.pacman.ttl);
    console.log(`track PacMan_TTL with: ${e.detail.pacman.ttl}`);
});

if (Modernizr.canvas && Modernizr.localstorage &&
    Modernizr.audio && (Modernizr.audio.ogg || Modernizr.audio.mp3)) {
    window.setTimeout(function () { PACMAN.init("./"); }, 0);
} else {
    el.innerHTML = "Sorry, needs a decent browser<br /><small>" +
        "(firefox 3.6+, Chrome 4+, Opera 10+ and Safari 4+)</small>";
}