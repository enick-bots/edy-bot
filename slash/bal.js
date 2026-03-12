const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Mira tus estadísticas o las de otro usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario a consultar')),
    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const userData = db.getUser(target.id);

        // Calcular posición en el ranking
        const ranking = Array.from(db.economyDB.entries())
            .map(([id, data]) => ({ id, coins: data.coins }))
            .sort((a, b) => b.coins - a.coins);
        
        const posicion = ranking.findIndex(u => u.id === target.id) + 1;

        const embed = new EmbedBuilder()
            .setTitle(`Perfil de ${target.username}`)
            .setColor(0x000000)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: 'Monedas', value: `${userData.coins}`, inline: true },
                { name: 'Tiradas gratis', value: `${userData.spins}`, inline: true },
                { name: 'Ranking', value: `#${posicion || 'Sin datos'}`, inline: true },
                { name: 'Racha diaria', value: `${userData.streak || 0} dias`, inline: true }
            )
            .setFooter({ text: `ID: ${target.id}` });

        await interaction.reply({ embeds: [embed] });
    },
};
