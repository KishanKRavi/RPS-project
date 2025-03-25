const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/about", (req, res) => res.send("about dev's"));
app.get("/", (req, res) => res.render("indexBoilerplate"));
app.get("/joinRoom", (req, res) => res.render("joinRoom"));
app.get("/game/:roomId", (req, res) => res.render("game", { roomId: req.params.roomId }));
app.get("/playnow", (req, res) => res.render("playnow"));

const rooms = {};

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("joinRoom", ({ roomId, playerName }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], choices: {}, scores: {} };
        }

        if (rooms[roomId].players.length >= 2) {
            socket.emit("roomFull", "Room is full.");
            return;
        }

        rooms[roomId].players.push({ id: socket.id, name: playerName });
        rooms[roomId].scores[socket.id] = 0;
        socket.join(roomId);

        console.log(`${playerName} joined room ${roomId}`);

        if (rooms[roomId].players.length === 2) {
            io.to(roomId).emit("startGame", rooms[roomId].players);
        }
    });

    socket.on("playerChoice", ({ roomId, choice }) => {
        if (!rooms[roomId] || rooms[roomId].players.length < 2) return;

        rooms[roomId].choices[socket.id] = choice;

        if (Object.keys(rooms[roomId].choices).length === 2) {
            const [player1, player2] = rooms[roomId].players;
            const choice1 = rooms[roomId].choices[player1.id];
            const choice2 = rooms[roomId].choices[player2.id];

            let winner = determineWinner(choice1, choice2, player1.name, player2.name);

            if (winner === player1.name) {
                rooms[roomId].scores[player1.id]++;
            } else if (winner === player2.name) {
                rooms[roomId].scores[player2.id]++;
            }

            io.to(roomId).emit("roundResult", {
                result: winner === "Draw" ? "Draw" : `${winner} won this round!`,
                scores: rooms[roomId].scores,
            });

            if (rooms[roomId].scores[player1.id] >= 5 || rooms[roomId].scores[player2.id] >= 5) {
                io.to(roomId).emit("gameOver", { winner });
                delete rooms[roomId];
            } else {
                rooms[roomId].choices = {};
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
    
        for (const roomId in rooms) {
            if (rooms[roomId]) {
                // Find the room where the player was
                const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
    
                if (playerIndex !== -1) {
                    // Remove the player from the room
                    rooms[roomId].players.splice(playerIndex, 1);
    
                    if (rooms[roomId].players.length === 0) {
                        delete rooms[roomId]; // Delete room if empty
                    } else {
                        // Notify only the remaining players in the same room
                        io.to(roomId).emit("opponentLeft");
                    }
    
                    break; // Stop checking other rooms
                }
            }
        }
    });
    
});

function determineWinner(choice1, choice2, name1, name2) {
    if (choice1 === choice2) return "Draw";
    if (
        (choice1 === "rock" && choice2 === "scissors") ||
        (choice1 === "paper" && choice2 === "rock") ||
        (choice1 === "scissors" && choice2 === "paper")
    ) {
        return name1; // Return only the winner's name
    }
    return name2; // Return only the winner's name
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT})`));
