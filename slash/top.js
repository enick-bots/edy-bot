const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('🏆 Muestra a los más ricos del servidor'),
    async execute(interaction) {
        // Convertir Map a Array y ordenar por coins
        const sorted = Array.from(db.economyDB.entries())
            .map(([id, data]) => ({ id, coins: data.coins }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle('🏆 Top 10 Riqueza')
            .setColor('Gold')
            .setTimestamp();

        let descripcion = "";
        for (let i = 0; i < sorted.length; i++) {
            const user = await interaction.client.users.fetch(sorted[i].id).catch(() => null);
            const nombre = user ? user.username : 'Desconocido';
            descripcion += `**${i + 1}.** ${nombre} — \`${sorted[i].coins}\` 🪙\n`;
        }

        embed.setDescription(descripcion || "No hay datos aún.");
        await interaction.reply({ embeds: [embed] });
    },
};
