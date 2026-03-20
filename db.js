const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// =========================
// 🧠 BASE FUNCTIONS
// =========================

function loadJSON(fileName, defaultData) {
    const filePath = path.join(dataDir, fileName);

    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);

    } catch (err) {
        console.error(`❌ Error cargando ${fileName}:`, err);

        // 🔥 Backup automático si se corrompe
        try {
            fs.renameSync(filePath, filePath + '.backup');
        } catch {}

        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

function saveJSON(fileName, data) {
    const filePath = path.join(dataDir, fileName);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        if (err.code !== 'EPERM') {
            console.error(`❌ Error guardando ${fileName}:`, err);
        }
    }
}

// =========================
// 📦 LOAD DATA
// =========================

let rawFrases = loadJSON('frases.json', {});
let rawPerms = loadJSON('permissions.json', {});
let rawConfigs = loadJSON('config.json', { cooldown: "10s", max_tags: 20, use_max: 5 });
let rawPics = loadJSON('pics.json', { goat: [], bad: [], meme: [] });
let rawEconomy = loadJSON('economy.json', {});
let rawImposter = loadJSON('imposter_words.json', {});

// =========================
// 🧠 CACHE
// =========================

let saveTimeout = null;
const lastWords = new Map();

// =========================
// 🚀 EXPORT
// =========================

module.exports = {

    emoji: '🪙',

    commandPermissions: new Collection(Object.entries(rawPerms)),
    frasesDB: new Map(Object.entries(rawFrases)),
    configDB: rawConfigs,
    picsDB: rawPics,
    economyDB: new Map(Object.entries(rawEconomy)),
    imposterDB: rawImposter,

    forcedNames: new Map(),
    snipes: new Map(),
    esnipes: new Map(),

    // =========================
    // 💰 ECONOMY
    // =========================

    getUser(userId) {
        if (!this.economyDB.has(userId)) {
            this.economyDB.set(userId, {
                coins: 0,
                spins: 0,
                lastDaily: 0,
                streak: 0
            });
            this.saveAll();
        }
        return this.economyDB.get(userId);
    },

    addCoins(userId, amount) {
        const user = this.getUser(userId);
        user.coins += amount;
        this.saveAll();
        return user.coins;
    },

    // =========================
    // 🎮 IMPOSTER SYSTEM
    // =========================

    getImposterData(tema) {
        const lista = this.imposterDB[tema];
        if (!lista?.length) return null;

        let selected;

        // 🔥 evitar repetir palabra
        do {
            selected = lista[Math.floor(Math.random() * lista.length)];
        } while (this.lastWords?.get(tema) === selected.palabra && lista.length > 1);

        lastWords.set(tema, selected.palabra);
        return selected;
    },

    addImposterWord(tema, palabra, pistas) {
        if (!this.imposterDB[tema]) {
            this.imposterDB[tema] = [];
        }

        this.imposterDB[tema].push({ palabra, pistas });
        this.saveAll();

        return true;
    },

    removeImposterWord(tema, palabra) {
        if (!this.imposterDB[tema]) return false;

        const before = this.imposterDB[tema].length;

        this.imposterDB[tema] = this.imposterDB[tema]
            .filter(w => w.palabra.toLowerCase() !== palabra.toLowerCase());

        this.saveAll();

        return before !== this.imposterDB[tema].length;
    },

    getAllWordsCount() {
        return Object.values(this.imposterDB)
            .reduce((acc, arr) => acc + arr.length, 0);
    },

    // =========================
    // 💾 SAVE SYSTEM (ANTI SPAM)
    // =========================

    saveAll() {
        if (saveTimeout) return;

        saveTimeout = setTimeout(() => {
            saveJSON('frases.json', Object.fromEntries(this.frasesDB));
            saveJSON('permissions.json', Object.fromEntries(this.commandPermissions));
            saveJSON('config.json', this.configDB);
            saveJSON('pics.json', this.picsDB);
            saveJSON('economy.json', Object.fromEntries(this.economyDB));
            saveJSON('imposter_words.json', this.imposterDB);

            saveTimeout = null;
        }, 1000);
    }
};

// =========================
// ⚠️ AUTO SAVE ON EXIT
// =========================

process.on('exit', () => {
    try {
        module.exports.saveAll();
    } catch {}
});

process.on('SIGINT', () => {
    try {
        module.exports.saveAll();
    } catch {}
    process.exit();
});
