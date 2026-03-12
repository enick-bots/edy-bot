const { EmbedBuilder } = require('discord.js');
const { esnipes } = require('../db.js');

module.exports = {
    name: "esnipe",
    aliases: ["es"],
    async execute(message, args) {
        const channelEsnipes = esnipes.get(message.channel.id);

        if (!channelEsnipes || channelEsnipes.length === 0) {
            return message.reply("No hay mensajes editados recientemente en este canal.");
        }

        let index = parseInt(args) || 1;

        if (index > 7) {
            return message.reply("Solo puedes ver hasta 7 mensajes atrás.");
        }

        const data = channelEsnipes[index - 1];

        if (!data) {
            return message.reply(`No hay un mensaje editado en la posición ${index}.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Mensage Sniped (Edit)')
            .setDescription(`Autor: ${data.author}\nAntes: ${data.oldContent}\nDespués: ${data.newContent}`)
            .setFooter({ 
                text: `${message.author.tag} at ${new Date().toLocaleTimeString()}`, 
                iconURL: message.author.displayAvatarURL() 
            });

        return message.channel.send({ embeds: [embed] });
    }
};