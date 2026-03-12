        // --- WORDLE ---
        if (sub === 'wordle') {
            const palabras = ['CASAS', 'PERRO', 'GATOS', 'MESAS', 'COCHE', 'LIMON', 'RADIO', 'PIANO'];
            const secreta = palabras[Math.floor(Math.random() * palabras.length)];
            let intentos = 0;
            const maxIntentos = 6;

            if (!esGratis) user.coins -= amount;
            db.saveAll();

            const embed = new EmbedBuilder()
                .setTitle('Juego de Wordle')
                .setDescription(`He pensado una palabra de 5 letras. Tienes ${maxIntentos} intentos.\nEscribe la palabra en el chat para jugar.`)
                .setColor(0x000000)
                .setFooter({ text: `Apuesta: ${amount} | Saldo: ${user.coins}` });

            await interaction.reply({ embeds: [embed] });

            const filter = m => m.author.id === interaction.user.id && m.content.length === 5;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async m => {
                intentos++;
                const intento = m.content.toUpperCase();
                let resultado = "";
                let aciertosVerdes = 0;

                // Lógica de colores
                for (let i = 0; i < 5; i++) {
                    if (intento[i] === secreta[i]) {
                        resultado += "🟩"; // Correcta
                        aciertosVerdes++;
                    } else if (secreta.includes(intento[i])) {
                        resultado += "🟨"; // Posición incorrecta
                    } else {
                        resultado += "⬛"; // No existe
                    }
                }

                if (intento === secreta) {
                    collector.stop('win');
                    const premio = Math.floor(amount * 3);
                    if (!esGratis) user.coins += premio;
                    db.saveAll();
                    return m.reply(`${resultado}\nGanaste. La palabra era ${secreta}. Recibes ${premio} coins.`);
                }

                if (intentos >= maxIntentos) {
                    collector.stop('lose');
                    return m.reply(`${resultado}\nPerdiste. La palabra era ${secreta}.`);
                }

                // Pago parcial por letras verdes (opcional, basado en tu idea de "conforme le atina gana")
                if (!esGratis && aciertosVerdes > 0) {
                    const bonus = aciertosVerdes * 5;
                    user.coins += bonus;
                    db.saveAll();
                    m.reply(`${resultado}\nIntento ${intentos}/${maxIntentos}. Ganaste ${bonus} coins por letras acertadas.`);
                } else {
                    m.reply(`${resultado}\nIntento ${intentos}/${maxIntentos}. Sigue intentando.`);
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') interaction.followUp({ content: 'Tiempo agotado. El juego de Wordle ha terminado.', ephemeral: true });
            });
        }
