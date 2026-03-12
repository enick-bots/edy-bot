const { EmbedBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    name: 'd',
    async execute(message, args) {
        const user = db.getUser(message.author.id);
        const now = Date.now();
        const unDia = 86400000;

        if (user.completedDaily) {
            return message.reply("🏁 Ya completaste el calendario de 7 dias");
        }

        if (user.lastDaily && (now - user.lastDaily < unDia)) {
            const faltan = unDia - (now - user.lastDaily);
            const horas = Math.floor(faltan / 3600000);
            const minutos = Math.floor((faltan % 3600000) / 60000);
            return message.reply(`⏳ Vuelve en ${horas}h ${minutos}m`);
        }

        // Reset de racha si pasan mas de 48h
        if (user.lastDaily && (now - user.lastDaily > 172800000)) {
            user.streak = 1;
        } else {
            user.streak = (user.streak || 0) + 1;
        }

        user.lastDaily = now;
        let premioTxt = "";

        switch (user.streak) {
            case 1: user.coins += 50; premioTxt = "💰 Recompensa: 50 coins"; break;
            case 2: user.spins += 1; premioTxt = "🎫 Recompensa: 1 tirada"; break;
            case 3: user.coins += 100; premioTxt = "💰 Recompensa: 100 coins"; break;
            case 4: user.spins += 2; premioTxt = "🎫 Recompensa: 2 tiradas"; break;
            case 5: user.coins += 150; premioTxt = "💰 Recompensa: 150 coins"; break;
            case 6: user.spins += 3; premioTxt = "🎫 Recompensa: 3 tiradas"; break;
            case 7: 
                user.coins += 300; 
                user.completedDaily = true;
                premioTxt = "🏆 Recompensa final: 300 coins y rol de Fracasado";
                
                const roleId = 'ID_DE_TU_ROL'; 
                const role = message.guild.roles.cache.get(roleId);
                if (role) message.member.roles.add(role).catch(() => null);
                break;
        }

        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle(`📅 Recompensa diaria: dia ${user.streak}/7`)
            .setDescription(premioTxt)
            .setColor(0x000000)
            .setFooter({ text: user.completedDaily ? 'Calendario finalizado' : 'Regresa mañana por tu siguiente premio' });

        message.reply({ embeds: [embed] });
    }
};
