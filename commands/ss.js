const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ss',
    async execute(message, args, user, db) {
        const history = db.esnipes.get(message.channel.id + "_reac_history");

        if (!history || history.length === 0) {
            return message.reply("Señor, no hay registros de reacciones eliminadas aquí.");
        }

        let selected;
        const query = args.join(" ").toLowerCase();

        if (!query) {
            // .ss (El último)
            selected = history[0];
        } else if (!isNaN(query)) {
            // .ss 1, .ss 2...
            const index = parseInt(query) - 1;
            selected = history[index];
        } else {
            // .ss <texto> (Busca por contenido del mensaje)
            selected = history.find(m => m.content.toLowerCase().includes(query));
        }

        if (!selected) return message.reply("No encontré ningún registro que coincida con esa búsqueda.");

        const embed = new EmbedBuilder()
            .setTitle("🕵️ Protocolo de Vigilancia de Emojis")
            .setDescription(`**Autor:** <@${selected.author.id}>\n**Mensaje:** ${selected.content}`)
            .setColor("#2b2d31")

        const lista = selected.users
            .map(u => `<@${u.id}> quitó su reacción ${u.emoji}`)
            .join('\n');

        embed.addFields({ name: "Reacciones Eliminadas:", value: lista || "Error al recuperar datos." });

        return message.channel.send({ embeds: [embed] });
    },
};
