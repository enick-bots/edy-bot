const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const loadJSON = (fileName, defaultData) => {
    const filePath = path.join(dataDir, fileName);
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error cargando ${fileName}:`, error);
        return defaultData;
    }
};

const saveJSON = (fileName, data) => {
    const filePath = path.join(dataDir, fileName);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        if (error.code !== 'EPERM') console.error(`❌ Error al guardar ${fileName}:`, error);
    }
};

// --- CARGA DE DATOS RESTANTES ---
let rawFrases = loadJSON('frases.json', {});
let rawPerms = loadJSON('permissions.json', {});
let rawConfigs = loadJSON('config.json', { cooldown: "10s", max_tags: 20, use_max: 5 });
let rawPics = loadJSON('pics.json', { goat: [], bad: [], meme: [] });
let rawEconomy = loadJSON('economy.json', {});

let saveTimeout = null;

module.exports = {
    emoji: '🪙',
    commandPermissions: new Collection(Object.entries(rawPerms)),
    frasesDB: new Map(Object.entries(rawFrases)),
    configDB: rawConfigs,
    picsDB: rawPics,
    economyDB: new Map(Object.entries(rawEconomy)), 
    
    forcedNames: new Map(),
    snipes: new Map(),
    esnipes: new Map(),

    getUser(userId) {
        if (!this.economyDB.has(userId)) {
            this.economyDB.set(userId, { coins: 0, spins: 0, lastDaily: 0, streak: 0 });
        }
        return this.economyDB.get(userId);
    },

    saveAll() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveJSON('frases.json', Object.fromEntries(this.frasesDB));
            saveJSON('permissions.json', Object.fromEntries(this.commandPermissions));
            saveJSON('config.json', this.configDB);
            saveJSON('pics.json', this.picsDB);
            saveJSON('economy.json', Object.fromEntries(this.economyDB));
            saveTimeout = null;
        }, 1000); 
    }
};
