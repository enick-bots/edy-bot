const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Mira las estadísticas de un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario a consultar')),

    async execute(interaction, user, db) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        const userData = db.getUser(targetUser.id);

        const creado = time(targetUser.createdAt, 'R');
        const unido = time(targetMember.joinedAt, 'R');
        const topRole = targetMember.roles.highest;

        // Lógica de visualización de saldo/deuda
        const saldoTexto = userData.coins < 0 
            ? `🔴 **Deuda:** ${userData.coins} ${db.emoji}` 
            : `Saldo: ${userData.coins} ${db.emoji}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Perfil de ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
            // Cambia a rojo si el usuario debe dinero
            .setColor(userData.coins < 0 ? '#ED4245' : (topRole.color || '#2b2d31'))
            .setThumbnail(targetUser.displayAvatarURL({ size: 512 }))
            .addFields(
                { 
                    name: '💰 Economía', 
                    value: `${saldoTexto}\nSpins: ${userData.spins} 🌀\nRacha: ${userData.streak || 0} días`, 
                    inline: true 
                },
                { name: '🛡️ Información', value: `Rol mas alto: ${topRole}\nID: ${targetUser.id}`, inline: true },
                { name: '📅 Fechas', value: `En Discord desde ${creado}\nSe unió al servidor ${unido}`, inline: false }
            )
            .setFooter({ 
                text: `Solicitado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        // Si debe dinero, añadimos un pequeño aviso extra en el footer o descripción
        if (userData.coins < 0) {
            embed.setDescription(`⚠️ *Este usuario tiene pagos pendientes con el casino.*`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
