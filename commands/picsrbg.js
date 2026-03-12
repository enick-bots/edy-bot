const { picsDB } = require('../db.js');

module.exports = {
    name: 'rpg',
    aliases: ['rpb', 'rpm', 'pg', 'pb', 'pr'],
    async execute(message, args) {
        const cmd = message.content.slice(1).split(' ')[0].toLowerCase();
        let cat = cmd.includes('pg') ? 'goat' : cmd.includes('pb') ? 'bad' : 'meme';
        let lista = picsDB[cat];

        if (lista.length === 0) return message.reply('no hay fotos en esta categoria.');

        const specificMatch = cmd.split('.');
        const index = specificMatch[1] ? parseInt(specificMatch[1]) - 1 : (args[0] ? parseInt(args[0]) - 1 : null);

        const img = (index !== null && lista[index]) ? lista[index] : lista[Math.floor(Math.random() * lista.length)];
        
        message.reply({ content: ` ${cat.toUpperCase()} pic:`, files: [img] });
    }
};