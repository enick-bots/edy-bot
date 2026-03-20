const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'shop',
    aliases: ['list', 'buy', 'tienda'],
    async execute(message, args, user, db) {
        // --- CONFIGURACIÓN DE LA TIENDA ---
        // ID del Rol y su precio
        const tiendaRoles = [
            { id: 'ID_DEL_ROL_1', nombre: 'VIP Bronce', precio: 5000, emoji: '🥉' },
            { id: 'ID_DEL_ROL_2', nombre: 'VIP Plata', precio: 15000, emoji: '🥈' },
            { id: 'ID_DEL_ROL_3', nombre: 'VIP Oro', precio: 50000, emoji: '🥇' },
            { id: 'ID_DEL_ROL_4', nombre: 'Rey del SV', precio: 100000, emoji: '👑' }
        ];

        const comando = message.content.toLowerCase().split(' ')[0].slice(1); // Detecta si usó .list o .buy

        // --- LÓGICA DE LISTA (.list) ---
        if (comando === 'list' || (comando === 'shop' && !args[0])) {
            const embed = new EmbedBuilder()
                .setTitle('🛒 Tienda de Roles')
                .setDescription('Usa `.buy <nombre>` para comprar un rol.\n\n' + 
                    tiendaRoles.map(r => `${r.emoji} **${r.nombre}** — ${r.precio} ${db.emoji}`).join('\n'))
                .setColor('#FEE75C')
                .setFooter({ text: `Tu saldo: ${user.coins} ${db.emoji}` });

            return message.reply({ embeds: [embed] });
        }

        // --- LÓGICA DE COMPRA (.buy) ---
        if (comando === 'buy' || args[0]) {
            const busqueda = args.join(' ').toLowerCase();
            const producto = tiendaRoles.find(r => r.nombre.toLowerCase() === busqueda);

            if (!producto) {
                return message.reply(`❌ No encontré el rol **${args.join(' ')}** en la tienda. Revisa el nombre con \`.list\`.`);
            }

            if (user.coins < producto.precio) {
                return message.reply(`❌ No tienes suficientes ${db.emoji}. Te faltan **${producto.precio - user.coins}**.`);
            }

            if (message.member.roles.cache.has(producto.id)) {
                return message.reply(`⚠️ Ya tienes el rol **${producto.nombre}**.`);
            }

            // --- CONFIRMACIÓN CON BOTONES ---
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirmar').setLabel('Confirmar Compra').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('cancelar').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
            );

            const confirmEmbed = new EmbedBuilder()
                .setTitle('Confirmar Compra')
                .setDescription(`¿Estás seguro de que quieres comprar **${producto.nombre}** por **${producto.precio} ${db.emoji}**?`)
                .setColor('#5865F2');

            const msg = await message.reply({ embeds: [confirmEmbed], components: [row] });

            const filter = i => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async i => {
                if (i.customId === 'cancelar') {
                    collector.stop();
                    return i.update({ content: '✅ Compra cancelada.', embeds: [], components: [] });
                }

                if (i.customId === 'confirmar') {
                    collector.stop();

                    // Verificar saldo de nuevo por si acaso
                    if (user.coins < producto.precio) return i.update({ content: '❌ Te quedaste sin dinero durante la transacción.', embeds: [], components: [] });

                    try {
                        const role = message.guild.roles.cache.get(producto.id);
                        if (!role) throw new Error('Rol no encontrado en el servidor.');

                        // Quitar monedas y dar rol
                        user.coins -= producto.precio;
                        await message.member.roles.add(role);
                        db.saveAll();

                        await i.update({ 
                            embeds: [new EmbedBuilder()
                                .setTitle('🎉 ¡Compra Exitosa!')
                                .setDescription(`Has comprado el rol **${producto.nombre}**.\nSe han descontado **${producto.precio} ${db.emoji}** de tu cuenta.`)
                                .setColor('#57F287')],
                            components: [] 
                        });
                    } catch (error) {
                        console.error(error);
                        await i.update({ content: '❌ Error: Asegúrate de que mi rol esté por encima del rol que quieres comprar.', embeds: [], components: [] });
                    }
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') msg.edit({ content: '⏰ Tiempo agotado.', components: [] });
            });
        }
    }
};
