const { EmbedBuilder } = require('discord.js');
const { frasesDB } = require('../db.js');

module.exports = {
    name: 'mateo',
    async execute(message) {
        const lista = frasesDB.get('mateo'); 
        
        if (!lista || lista.length === 0) {
            return message.reply('😿 No hay frases de mateo.');
        }

        const random = lista[Math.floor(Math.random() * lista.length)];

        const embed = new EmbedBuilder()
            .setColor('#2ECC71') 
            .setTitle('🐱 Frases de mateo')
            .setDescription(random)
            .setThumbnail('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWdjdW5rMnRxZ29ieDIwbjU1YTIxbG82MGE2Z2p0OWQ0dGJuMXNkZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TjSPQgowhhJdHgvnwA/giphy.gif')
            .setFooter({ 
                text: `Solicitado por ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        message.reply({ embeds: [embed] });
    }
};
