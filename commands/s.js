const { EmbedBuilder } = require('discord.js');
const { snipes } = require('../db.js');

module.exports = {
    name: "snipe",
    aliases: ["s"],
    async execute(message, args) {
        const channelSnipes = snipes.get(message.channel.id);

        if (!channelSnipes || channelSnipes.length === 0) {
            return message.reply("No tengo mensajes borrados");
        }

        const index = parseInt(args[0]) - 1 || 0;
        const targetSnipe = channelSnipes[index];

        if (!targetSnipe) {
            return message.reply(`Solo tengo guardados ${channelSnipes.length} mensajes eliminados.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#d62525')
            .setAuthor({ 
                name: targetSnipe.author.tag, 
                iconURL: targetSnipe.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(targetSnipe.content)
            .setFooter({ text: `Mensaje ${index + 1}/${channelSnipes.length}` })
            .setTimestamp(targetSnipe.timestamp);

        if (targetSnipe.image) {
            embed.setImage(targetSnipe.image);
        }

        return message.channel.send({ embeds: [embed] });
           }
};