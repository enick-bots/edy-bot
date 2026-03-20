const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Adivina la palabra y gana coins')
        .addIntegerOption(option => 
            option.setName('apuesta')
                .setDescription('Cantidad de coins a apostar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('dificultad')
                .setDescription('Nivel de dificultad')
                .setRequired(true)
                .addChoices(
                    { name: 'Fácil (x1.2)', value: 'facil' },
                    { name: 'Medio (x2.0)', value: 'medio' },
                    { name: 'Difícil (x3.5)', value: 'dificil' }
                )),

    async execute(interaction, user, db) {
        const amount = interaction.options.getInteger('apuesta');
        const dificultad = interaction.options.getString('dificultad');
        
        if (amount < 10) return interaction.reply({ content: 'La apuesta mínima es de 10 ' + db.emoji, flags: [MessageFlags.Ephemeral] });
        if (user.coins < amount) return interaction.reply({ content: `No tienes suficiente saldo (${user.coins} ${db.emoji})`, flags: [MessageFlags.Ephemeral] });

        // --- FIX AQUÍ: Se añadieron los números de letras ---
        const config = {
            facil: { mult: 1.2, letras: [3, 4] },
            medio: { mult: 2.0, letras: [5, 6] },
            dificil: { mult: 3.5, letras: [7] }
        };

        const palabrasPool = [
            'SOL', 'PAN', 'MAR', 'LUZ', 'RIO', 'GAS', 'VIA', 'GOL', 'CASA', 'VIDA', 'COMA', 'TREN', 'BOLA', 'MESA', 'ROSA', 
            'PERRO', 'GATOS', 'MESAS', 'COCHE', 'LIMON', 'RADIO', 'PIANO', 'ARBOL', 'BARCO', 'LIBRO', 'MANO', 'CIELO', 
            'PLANET', 'BLANCO', 'CAMINO', 'CUERPO', 'DORMIR', 'ESPEJO', 'FUERTE', 'HIERRO', 'JARDIN', 'LLUVIA', 'MADERA', 
            'PLANETA', 'ESTRELLA', 'BOTONES', 'COMIDA', 'GUITARRA', 'QUERER', 'RAPIDO', 'DESTINO', 'CABALLO', 'CERVEZA'
        ];

        const filtradas = palabrasPool.filter(p => config[dificultad].letras.includes(p.length));
        const secreta = filtradas[Math.floor(Math.random() * filtradas.length)].toUpperCase();
        const longitud = secreta.length;
        let intentos = 0;
        const maxIntentos = 6;

        user.coins -= amount;
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('🎮 WORDLE: ' + dificultad.toUpperCase())
            .setDescription(`He pensado una palabra de **${longitud}** letras.\nTienes **${maxIntentos}** intentos.\n\nEscribe tu respuesta en el chat.`)
            .setColor('#2b2d31')
            .setFooter({ text: `Apuesta: ${amount}${db.emoji} | Multiplicador: ${config[dificultad].mult}x` });

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id && m.content.length === longitud;
        const collector = interaction.channel.createMessageCollector({ filter, time: 100000 });

        collector.on('collect', async m => {
            intentos++;
            const intento = m.content.toUpperCase();
            let tempSecreta = secreta.split('');
            let resultado = Array(longitud).fill('⬛');

            for (let i = 0; i < longitud; i++) {
                if (intento[i] === tempSecreta[i]) {
                    resultado[i] = '🟩';
                    tempSecreta[i] = null;
                }
            }
            for (let i = 0; i < longitud; i++) {
                if (resultado[i] === '⬛' && tempSecreta.includes(intento[i])) {
                    resultado[i] = '🟨';
                    tempSecreta[tempSecreta.indexOf(intento[i])] = null;
                }
            }

            const visual = resultado.join('');

            if (intento === secreta) {
                const premio = Math.floor(amount * config[dificultad].mult);
                user.coins += premio;
                db.saveAll();
                collector.stop('win');
                return m.reply(`${visual}\n\n🏆 **¡GANASTE!**\nPalabra: \`${secreta}\`\nRecibes **${premio} ${db.emoji}**.`);
            }

            if (intentos >= maxIntentos) {
                collector.stop('lose');
                return m.reply(`${visual}\n\n💀 **PERDISTE.**\nLa palabra era \`${secreta}\`.`);
            }

            m.reply(`${visual} \`Intento ${intentos}/${maxIntentos}\``);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: `⏰ Tiempo agotado. La palabra era \`${secreta}\`.`, flags: [MessageFlags.Ephemeral] });
            }
        });
    }
};
