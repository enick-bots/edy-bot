const { EmbedBuilder } = require('discord.js');
const { commandPermissions, forcedNames } = require('../db.js');

module.exports = {
    name: "fn",
    aliases: ["f"],
    async execute(message, args) {
        const requiredRoleId = commandPermissions.get("fn") || commandPermissions.get("f");

        if (requiredRoleId) {
            if (!message.member.roles.cache.has(requiredRoleId)) {
                return message.reply("No tienes el rol necesario configurado en .config para usar este comando.");
            }
        }

        const targetMember = message.mentions.members.first();
        if (!targetMember) return message.reply("Mention a user.");

        const oldName = targetMember.displayName;
        const newNickname = args.slice(1).join(" ");

        try {
            if (!newNickname) {
                if (!forcedNames.has(targetMember.id)) {
                    return message.reply(" Este usuario no tiene Nombre Forzado (fn).");
                }

                const original = forcedNames.get(targetMember.id);
                await targetMember.setNickname(original);
                forcedNames.delete(targetMember.id);

                const resEmbed = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setDescription(`Nombre restaurado para ${targetMember.user.username}`);

                return message.channel.send({ embeds: [resEmbed] });
            }

            if (newNickname.length > 32) return message.reply("El nombre es muy largo (max 32).");

            if (!forcedNames.has(targetMember.id)) {
                forcedNames.set(targetMember.id, targetMember.nickname || targetMember.user.username);
            }

            await targetMember.setNickname(newNickname);

            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription(`Fn para ${targetMember}\n\n Nombre antiguo: ${oldName}\n Nombre nuevo: ${newNickname}`);

            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            return message.reply("No puedo cambiar el nombre de ese usuario (revisa permisos/roles).");
        }
    }
};