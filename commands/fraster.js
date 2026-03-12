const { frasesDB } = require('../db.js');

module.exports = {
    name: 'fraster',
    async execute(message) {
        const lista = frasesDB.get('fraster');
        if (!lista || lista.length === 0) return message.reply('no hay frases para fraster.');

        const random = lista[Math.floor(Math.random() * lista.length)];
        message.reply(random);
    }
};