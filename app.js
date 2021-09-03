const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(process.env.port || 3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const ConvertDb = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API-1 get entire list
app.get("/players/", async (request, response) => {
  const getPlayers = `
        SELECT 
        *
        FROM 
        cricket_team
    `;
  const playerArray = await db.all(getPlayers);
  response.send(playerArray);
});

//API-2 post
app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const addPlayer = `
    INSERT INTO 
        cricket_team(player_name,jersey_number,role)
    VALUES 
        (
            '${playerName}',
            '${jerseyNumber}',
            '${role}'
        );
    `;
  const dbDetails = await db.run(addPlayer);
  response.send("Player Added to Team");
});

//API-3
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};
    `;
  const player = await db.get(playerQuery);
  response.send(ConvertDb(player));
});

//API-4
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId}
    `;
  await db.run(query);
  response.send("Player Details Updated");
});

//API-5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM 
        cricket_team 
    WHERE 
        player_id = ${playerId};
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});