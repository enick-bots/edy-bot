const { frasesDB } = require('../db.js');

module.exports = {
    name: 'edy',
    async execute(message) {
        const lista = frasesDB.get('edy');
        if (!lista || lista.length === 0) return message.reply('no hay frases para edy.');

        const random = lista[Math.floor(Math.random() * lista.length)];
        message.reply(random);
    }
};