const { EmbedBuilder } = require('discord.js');
const { commandPermissions } = require('../db.js');

module.exports = {
    name: 'config',
    async execute(message, args) {
         const rolesAutorizados = ['1413905048878059682', '1417609503934775397',"1436875228339765381","1432583674683195432"]; 
        
        const tieneRol = message.member.roles.cache.some(rol => rolesAutorizados.includes(rol.id));

        if (!tieneRol) {
            const noPerms = await message.reply('no tienes el rol necesario para usar configuracion.');
            setTimeout(() => {
                noPerms.delete().catch(e => {});
                message.delete().catch(e => {});
            }, 4000);
            return;
        }

      
        if (!args[0]) {
            const mainEmbed = new EmbedBuilder()
                .setTitle('⚙️ Configura Roles')
                .setDescription('Para configurar tus roles usa .config <cmd> <user/role ID>\nSi necesitas informacion de un rol usa .config <cmd>\nPara ver los comandos usa .help')
                .setColor(0x2f3136);
            return message.reply({ embeds: [mainEmbed] });
        }

        const cmdName = args[0].toLowerCase();
        const target = args[1];

        const targetCommand = message.client.commands.get(cmdName) || 
                             message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

        if (!targetCommand) {
            return message.reply(`La ejecucion de ${cmdName} no existe.`);
        }


        if (!target) {
            const currentRole = commandPermissions.get(targetCommand.name);
            const status = currentRole ? `<@&${currentRole}>` : 'publico';
            
            const statusEmbed = new EmbedBuilder()
                .setTitle(`⚙️ ${targetCommand.name} Configuracion`)
                .setDescription(`Estado actual del rol: ${status}\n\nPara agregar mas Roles/Usuario usa .config <cmd> <user/rol>\nPara poner publico usa .config <cmd> everyone`)
                .setColor(0x2f3136);
            return message.reply({ embeds: [statusEmbed] });
        }

   
        const publicOptions = ['off', 'none', 'everyone', 'public'];
        
        if (publicOptions.includes(target.toLowerCase())) {
            commandPermissions.delete(targetCommand.name);
            const msg = await message.reply('⚙️ Configuracion actualizada: ahora es publico.');
            setTimeout(() => { 
                msg.delete().catch(e => {}); 
                message.delete().catch(e => {});
            }, 5000);
            return;
        }

        const roleId = target.replace(/[<@&>!]/g, '');
        commandPermissions.set(targetCommand.name, roleId);
        
        const successMsg = await message.reply(`⚙️ Configuracion para ${targetCommand.name} actualizada a ${target}.`);
        
        
        setTimeout(() => { 
            successMsg.delete().catch(e => {}); 
            message.delete().catch(e => {});
        }, 5000);
    }
};