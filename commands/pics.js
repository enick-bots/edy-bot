const { EmbedBuilder } = require('discord.js');
const { picsDB } = require('../db.js');

module.exports = {
    name: 'pics',
    async execute(message, args) {
        const cat = args[0]?.toLowerCase();
        if (!['goat', 'bad', 'meme'].includes(cat)) return message.reply('uso: .pics <goat/bad/meme>');

        const prefix = cat === 'goat' ? 'pg' : cat === 'bad' ? 'pb' : 'pr';
        const lista = picsDB[cat].map((url, i) => `${prefix}.${i + 1}`).join('\n') || 'vacia';

        const embed = new EmbedBuilder()
            .setTitle(` listado de fotos: ${cat}`)
            .setDescription(lista)
            .setColor(0x2f3136);

        message.reply({ embeds: [embed] });
    }
};
