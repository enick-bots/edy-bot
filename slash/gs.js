const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dar-spins')
        .setDescription('Otorga tiradas gratis de slot a un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Monto').setRequired(true)),

    async execute(interaction) {
        const rolesStaff = ['1413905048878059682', '1417609503934775397', "1436875228339765381", "1432583674683195432","819610352111190077","1436489760674938960","1408296046873808917","1408295542232055808"];
        
        // FIX: Verificar permisos correctamente
        if (!interaction.member.roles.cache.some(role => rolesStaff.includes(role.id))) {
            return interaction.reply({ content: "❌ No tienes permiso.", flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        if (amount <= 0) return interaction.reply({ content: "Monto inválido", flags: [MessageFlags.Ephemeral] });

        const user = db.getUser(target.id);
        user.spins += amount;
        db.saveAll(); 

        const embed = new EmbedBuilder()
            .setTitle('🌀 Tiradas de Regalo')
            .setDescription(`Se agregaron **${amount}** tiradas gratis a ${target}`)
            .setColor('#5865F2') 
            .addFields(
                { name: 'Tiradas totales', value: `${user.spins} 🌀`, inline: true },
                { name: 'Saldo coins', value: `${user.coins} ${db.emoji}`, inline: true }
            )
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
