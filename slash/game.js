class ImposterGame {
    constructor(host, maxPlayers, numImposters, usePistas) {
        this.host = host;
        this.maxPlayers = maxPlayers;
        this.numImposters = numImposters;
        this.usePistas = usePistas;

        this.players = [host];
        this.bannedIds = [];

        this.started = false;
        this.imposterIds = [];
        this.word = "";
    }

    addPlayer(user) {
        if (this.started) return "La partida ya empezó.";
        if (this.players.length >= this.maxPlayers) return "La sala está llena.";
        if (this.players.some(p => p.id === user.id)) return "Ya estás en la sala.";
        if (this.bannedIds.includes(user.id)) return "Fuiste expulsado de esta partida.";

        this.players.push(user);
        return "ok";
    }

    removePlayer(userId) {
        if (this.started) return "No puedes salir, el juego ya empezó.";

        this.players = this.players.filter(p => p.id !== userId);

        // Si el host se va → cancelar partida
        if (userId === this.host.id) {
            return "host_left";
        }

        return "ok";
    }

    banPlayer(userId) {
        this.players = this.players.filter(p => p.id !== userId);
        this.bannedIds.push(userId);
        return "ok";
    }

    isPlayer(userId) {
        return this.players.some(p => p.id === userId);
    }

    canStart() {
        if (this.started) return "Ya inició.";
        if (this.players.length < 4) return "Mínimo 4 jugadores.";
        if (this.numImposters >= this.players.length) return "Demasiados impostores.";
        return "ok";
    }

    startGame(word, pistasData) {
        this.started = true;
        this.word = word;

        const shuffled = [...this.players]
            .map(p => ({ p, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ p }) => p);

        const impostores = shuffled.slice(0, this.numImposters);
        this.imposterIds = impostores.map(p => p.id);

        return this.players.map(p => {
            const esImpostor = this.imposterIds.includes(p.id);

            return {
                user: p,
                role: esImpostor ? "impostor" : "crew",
                pista: esImpostor && this.usePistas
                    ? pistasData[Math.floor(Math.random() * pistasData.length)]
                    : null,
                word: esImpostor ? null : this.word
            };
        });
    }
}

module.exports = ImposterGame;
