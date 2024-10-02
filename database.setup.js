import dotenv from "dotenv";
dotenv.config();
import PG from "pg";
const client = PG.Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  await client.connect();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS JSONS (
        id VARCHAR(255) NOT NULL,
        index SERIAL PRIMARY KEY,
        data TEXT NOT NULL
    )
`;

  try {
    await client.query(createTableQuery);
    console.log("Table JSONS created");
  } catch (e) {
    console.log(e);
  }
})();
