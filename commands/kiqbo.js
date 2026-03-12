const { frasesDB } = require('../db.js');

module.exports = {
    name: 'kiqbo',
    async execute(message) {
        const lista = frasesDB.get('kiqbo');
        if (!lista || lista.length === 0) return message.reply('no hay frases para kiqbo.');

        const random = lista[Math.floor(Math.random() * lista.length)];
        message.reply(random);
    }
};