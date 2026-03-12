const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'flor',
    async execute(message) {
        const lista = frasesDB.get('flor');
        
        if (!lista || lista.length === 0) {
            return message.reply('🥀 No hay frases de <@1338431848417591388>.');
        }

        const random = lista[Math.floor(Math.random() * lista.length)];

        const embed = new EmbedBuilder()
            .setColor('#FF69B4') 
            .setTitle('🌸 Frases de <@1338431848417591388>')
            .setDescription(random)
 
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        message.reply({ embeds: [embed] });
    }
};
