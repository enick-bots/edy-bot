const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 1. PRIMERO DEFINIMOS LAS FUNCIONES
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

// 2. LUEGO CARGAMOS LOS DATOS USANDO ESAS FUNCIONES
let rawFrases = loadJSON('frases.json', {});
let rawPerms = loadJSON('permissions.json', {});
let rawConfigs = loadJSON('config.json', { cooldown: "10s", max_tags: 20, use_max: 5 });
let rawPics = loadJSON('pics.json', { goat: [], bad: [], meme: [] });
let rawEconomy = loadJSON('economy.json', {});

// Aquí va tu lista de 50+ palabras (resumida para el ejemplo)
let rawImposter = loadJSON('imposter_words.json', {
    "Cine": [
        { palabra: "Batman", pistas: ["Capa", "Gotham", "Noche", "Murciélago"] },
        { palabra: "Shrek", pistas: ["Ogro", "Pantano", "Burro", "Verde"] },
        { palabra: "Titanic", pistas: ["Barco", "Iceberg", "Océano", "Rose"] },
        { palabra: "Spider-Man", pistas: ["Telaraña", "Rojo", "Salto", "Nueva York"] },
        { palabra: "Harry Potter", pistas: ["Mago", "Varita", "Cicatriz", "Búho"] },
        { palabra: "Star Wars", pistas: ["Sable", "Fuerza", "Espacio", "Galaxia"] },
        { palabra: "Avatar", pistas: ["Azul", "Selva", "Naturaleza", "Flecha"] },
        { palabra: "Joker", pistas: ["Risa", "Maquillaje", "Caos", "Payaso"] },
        { palabra: "Avengers", pistas: ["Equipo", "Gema", "Héroe", "Escudo"] },
        { palabra: "Toy Story", pistas: ["Juguete", "Vaquero", "Bota", "Amistad"] },
        { palabra: "Frozen", pistas: ["Nieve", "Hielo", "Princesa", "Castillo"] },
        { palabra: "Minions", pistas: ["Banana", "Amarillo", "Gafas", "Villano"] },
        { palabra: "Matrix", pistas: ["Píldora", "Código", "Simulación", "Gafas"] },
        { palabra: "Rey León", pistas: ["Sabana", "Rugido", "Selva", "Cachorro"] },
        { palabra: "Jurassic Park", pistas: ["Dinosaurio", "Isla", "Hueso", "ADN"] }
        // Agrega más aquí siguiendo este formato [{palabra, pistas}, ...]
    ],
    "Lugares": [
        { palabra: "París", pistas: ["Torre", "Francia", "Pan", "Arte"] },
        { palabra: "Egipto", pistas: ["Pirámide", "Faraón", "Desierto", "Río"] },
        { palabra: "Londres", pistas: ["Reloj", "Niebla", "Reina", "Puente"] },
        { palabra: "Japón", pistas: ["Sushi", "Anime", "Isla", "Tecnología"] },
        { palabra: "Roma", pistas: ["Coliseo", "Pizza", "Historia", "Gladiador"] },
        { palabra: "Nueva York", pistas: ["Estatua", "Rascacielos", "Taxi", "Manzana"] },
        { palabra: "Brasil", pistas: ["Fútbol", "Selva", "Carnaval", "Playa"] },
        { palabra: "China", pistas: ["Muralla", "Dragón", "Arroz", "Panda"] },
        { palabra: "México", pistas: ["Taco", "Sombrero", "Mariachi", "Picante"] },
        { palabra: "Australia", pistas: ["Canguro", "Isla", "Desierto", "Ópera"] }
    ],
    "Comida": [
        { palabra: "Pizza", pistas: ["Masa", "Queso", "Horno", "Italia"] },
        { palabra: "Hamburguesa", pistas: ["Carne", "Pan", "Ketchup", "Papas"] },
        { palabra: "Sushi", pistas: ["Arroz", "Pescado", "Palillos", "Alga"] },
        { palabra: "Taco", pistas: ["Tortilla", "Carne", "Picante", "Cebolla"] },
        { palabra: "Helado", pistas: ["Frío", "Copa", "Dulce", "Chocolate"] },
        { palabra: "Pasta", pistas: ["Tenedor", "Salsa", "Trigo", "Agua"] },
        { palabra: "Chocolate", pistas: ["Dulce", "Marrón", "Leche", "Cacao"] },
        { palabra: "Donas", pistas: ["Agujero", "Dulce", "Glaseado", "Caja"] },
        { palabra: "Café", pistas: ["Grano", "Taza", "Negro", "Energía"] },
        { palabra: "Paella", pistas: ["Arroz", "Sartén", "Marisco", "España"] }
    ],
    "Animales": [
        { palabra: "Perro", pistas: ["Ladrido", "Hueso", "Leal", "Caminar"] },
        { palabra: "Gato", pistas: ["Maullido", "Ratón", "Leche", "Dormir"] },
        { palabra: "Elefante", pistas: ["Trompa", "Grande", "Gris", "Orejas"] },
        { palabra: "León", pistas: ["Melena", "Rey", "Rugido", "Selva"] },
        { palabra: "Tiburón", pistas: ["Dientes", "Aleta", "Mar", "Peligro"] },
        { palabra: "Mono", pistas: ["Banana", "Árbol", "Gracioso", "Pelaje"] },
        { palabra: "Delfín", pistas: ["Agua", "Inteligente", "Salto", "Océano"] },
        { palabra: "Pingüino", pistas: ["Frío", "Hielo", "Vuelo", "Pájaro"] },
        { palabra: "Jirafa", pistas: ["Cuello", "Alto", "Manchas", "Hojas"] },
        { palabra: "Lobo", pistas: ["Luna", "Manada", "Aullido", "Bosque"] }
    ]
});

let saveTimeout = null;

// 3. EXPORTAMOS TODO
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

    getUser(userId) {
        if (!this.economyDB.has(userId)) {
            this.economyDB.set(userId, { coins: 0, spins: 0, lastDaily: 0, streak: 0 });
        }
        return this.economyDB.get(userId);
    },

    // Esta función elige una palabra AL AZAR del tema que le pases
    getImposterData(tema) {
        const lista = this.imposterDB[tema];
        if (!lista || lista.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * lista.length);
        return lista[randomIndex];
    },

    saveAll() {
        if (saveTimeout) clearTimeout(saveTimeout);
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
