const { frasesDB } = require('../db.js');

module.exports = {
    name: 'gustambo',
    async execute(message) {
        const lista = frasesDB.get('gustambo');
        if (!lista || lista.length === 0) return message.reply('no hay frases para gustambo.');

        const random = lista[Math.floor(Math.random() * lista.length)];
        message.reply(random);
    }
};