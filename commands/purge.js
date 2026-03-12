const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "purge",
    aliases: ["clear", "c"],
    async execute(message, args) {
        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            return message.reply("Debes poner un número de mensajes a borrar.");
        }

        if (amount < 1 || amount > 100) {
            return message.reply("Solo puedes borrar entre 1 y 100 mensajes.");
        }

        try {
            await message.delete();

         
            await message.channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setColor('#e0d429')
                .setDescription(`🧹 Purge hecho: se eliminaron ${amount} mensajes.`);

            const response = await message.channel.send({ embeds: [embed] });

            setTimeout(() => {
                if (response.deletable) response.delete();
            }, 3000);

        } catch (error) {
            return message.channel.send("No puedo borrar mensajes de hace más de 14 días o me faltan permisos.");
        }
    }
};