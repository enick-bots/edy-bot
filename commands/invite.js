const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'invite',
    execute(message) {
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=1478402980117217392&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        const inviteEmbed = new EmbedBuilder()
            .setTitle("📩 Protocolo de Invitación")
            .setDescription("Señor, he generado un enlace de acceso para mi despliegue en otros sectores.")
            .addFields({ name: "Acceso Directo", value: `[Haz clic aquí para invitarme](${inviteLink})` })
            .setThumbnail(message.client.user.displayAvatarURL())
            .setColor("#2b2d31")
            .setFooter({ text: "Eduardo BS system" });

        return message.reply({ embeds: [inviteEmbed] });
    }
};
