const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'master',
    async execute(message) {
        const lista = frasesDB.get('master');
        
        if (!lista || lista.length === 0) {
            return message.reply('🌊 No hay frases para master.');
        }

        const random = lista[Math.floor(Math.random() * lista.length)];

        const embed = new EmbedBuilder()
            .setColor('#0525b1') // Azul océano
            .setTitle('🌊 Frases de master')
            .setDescription(`**${random}**`)
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        message.reply({ embeds: [embed] });
    }
};
