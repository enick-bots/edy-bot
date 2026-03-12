const { SlashCommandBuilder } = require('discord.js');
const { picsDB } = require('../db.js'); 


module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminate')
        .setDescription('Elimina una foto')
        .addStringOption(opt => opt.setName('pic').setDescription('Ej: pr.5').setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('pic').toLowerCase();
        const [pre, num] = input.split('.');
        const cat = pre === 'pg' ? 'goat' : pre === 'pb' ? 'bad' : 'meme';
        const idx = parseInt(num) - 1;

        if (!picsDB[cat] || !picsDB[cat][idx]) return interaction.reply('⚙️ no existe esa foto.');

        picsDB[cat].splice(idx, 1);
        await interaction.reply({ content: `⚙️ se elimino pic ${input}`, ephemeral: true });
    }
};
