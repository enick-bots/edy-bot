const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Transfiere monedas a otro usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Destinatario').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a enviar').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        const remitente = db.getUser(interaction.user.id);
        const receptorUser = interaction.options.getUser('usuario');
        const cantidad = interaction.options.getInteger('cantidad');

        if (receptorUser.id === interaction.user.id) {
            return interaction.reply({ content: 'No puedes enviarte monedas a ti mismo', ephemeral: true });
        }

        if (receptorUser.bot) {
            return interaction.reply({ content: 'No puedes enviar monedas a un bot', ephemeral: true });
        }

        if (remitente.coins < cantidad) {
            return interaction.reply({ content: `No tienes suficientes monedas. Saldo: ${remitente.coins}`, ephemeral: true });
        }

        const receptor = db.getUser(receptorUser.id);

        // Lógica de transferencia
        remitente.coins -= cantidad;
        receptor.coins += cantidad;
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('Transferencia Realizada')
            .setColor(0x000000)
            .setDescription(`Enviaste ${cantidad} monedas a ${receptorUser.username}`)
            .addFields(
                { name: 'Tu nuevo saldo', value: `${remitente.coins}`, inline: true },
                { name: 'Recibido por', value: `${receptorUser.username}`, inline: true }
            )
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.reply({ embeds: [embed] });
    },
};
