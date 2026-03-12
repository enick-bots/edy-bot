const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'copy',
    async execute(message) {
        const lista = frasesDB.get('copy');
        
        if (!lista || lista.length === 0) {
            return message.reply(' No hay copys');
        }

        const random = lista[Math.floor(Math.random() * lista.length)];

        const embed = new EmbedBuilder()
            .setColor('#0099ff') 
            .setTitle('📜 Aquí tienes un copy')
            .setDescription(random)
            .setTimestamp()
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        message.reply({ embeds: [embed] });
    }
};
