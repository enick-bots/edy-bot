const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Autoriza el rol de mando para protocolos restringidos')
        .addRoleOption(option => option.setName('rol').setDescription('El rol que tendrá el poder').setRequired(true)),

    async execute(interaction, db) {


        const DEVELOPERS = ['1442784860170096711']; // <--- PON TU ID AQUÍ
        
        if (!DEVELOPERS.includes(interaction.user.id)) {
            return interaction.reply({ 
                content: "⚠️ **Acceso denegado:** Solo el Desarrollador Principal puede configurar mandos globales.", 
                ephemeral: true 
            });
        }

        const rol = interaction.options.getRole('rol');

        // Guardar en la base de datos (config.json) usando el ID del servidor como clave
        if (!db.configDB[interaction.guild.id]) db.configDB[interaction.guild.id] = {};
        db.configDB[interaction.guild.id].adminRole = rol.id;
        
        // Guardar cambios en el disco
        db.saveAll();

        // Crear el Embed informativo
        const adminEmbed = new EmbedBuilder()
            .setTitle("✅ Protocolo de Mando Actualizado")
            .setDescription(`El rol **${rol.name}** ha sido vinculado a mis sistemas centrales en **${interaction.guild.name}**.`)
            .addFields(
                { 
                    name: "⌨️ Prefijos Autorizados:", 
                    value: "`config`, `tag`" 
                },
                { 
                    name: "🖱️ Slash Autorizados:", 
                    value: "`/dar-spins`, `/quitar-spins`, `/dar-coins`, `/quitar-coins`" 
                }
            )
            .setColor("#00ff00")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: `ID del Rol: ${rol.id} • Jarvis System` })
            .setTimestamp();

        return interaction.reply({ embeds: [adminEmbed] });
    }
};
