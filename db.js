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
        if (error.code === 'EPERM') {
            console.warn(`⚠️ No se pudo escribir en ${fileName} (Archivo en uso). Se reintentará.`);
        } else {
            console.error(`❌ Error crítico al guardar ${fileName}:`, error);
        }
    }
};

// --- Carga de datos inicial ---
let rawFrases = loadJSON('frases.json', {});
let rawPerms = loadJSON('permissions.json', {});
let rawConfigs = loadJSON('config.json', { cooldown: "10s", max_tags: 20, use_max: 5 });
let rawPics = loadJSON('pics.json', { goat: [], bad: [], meme: [] });
// Nueva base de datos para Economía (Coins, Spins, Dailies)
let rawEconomy = loadJSON('economy.json', {});

module.exports = {
    commandPermissions: new Collection(Object.entries(rawPerms)),
    frasesDB: new Map(Object.entries(rawFrases).map(([k, v]) => [k, v])),
    configDB: rawConfigs,
    picsDB: rawPics,
    // Nueva Map para economía: Clave = UserID, Valor = { coins, spins, lastDaily, streak }
    economyDB: new Map(Object.entries(rawEconomy)), 
    
    forcedNames: new Map(),
    snipes: new Map(),
    esnipes: new Map(),

    // Función de utilidad para obtener o crear perfil de usuario rápidamente
    getUser(userId) {
        if (!this.economyDB.has(userId)) {
            this.economyDB.set(userId, { coins: 0, spins: 0, lastDaily: 0, streak: 0 });
        }
        return this.economyDB.get(userId);
    },

    saveAll() {
        saveJSON('frases.json', Object.fromEntries(this.frasesDB));
        saveJSON('permissions.json', Object.fromEntries(this.commandPermissions));
        saveJSON('config.json', this.configDB);
        saveJSON('pics.json', this.picsDB);
        // Guardar economía
        saveJSON('economy.json', Object.fromEntries(this.economyDB));
    }
};
