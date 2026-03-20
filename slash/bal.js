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

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Perfil de ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
            .setColor(topRole.color || '#2b2d31')
            .setThumbnail(targetUser.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: '💰 Economía', value: `Saldo: ${userData.coins} ${db.emoji}\nSpins: ${userData.spins} 🌀\nRacha: ${userData.streak || 0} días`, inline: true },
                { name: '🛡️ Información', value: `Rol mas alto: ${topRole}\nID: ${targetUser.id}`, inline: true },
                { name: '📅 Fechas', value: `En Discord desde ${creado}\nSe unió al servidor ${unido}`, inline: false }
            )
            .setFooter({ 
                text: `Solicitado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
