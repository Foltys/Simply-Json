import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import assert from "assert";
import cors from "cors";

//idcka +
const app = express();
// app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use(express.text());
// app.use(bodyParser.)

// const corsOptions = {
// 	origin: ['http://cfc.aspone.cz/'],
// 	methods: ['GET', 'DELETE', 'PUT', 'OPTIONS'],
// 	allowedHeaders: ['Content-Type']

// }

// app.use(cors(corsOptions))
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT,GET,POST,DELETE",
    "Access-Control-Allow-Headers": "*",
    "Referrer-Policy": "origin",
  });
  next();
});

const port = 3000;
const table = "JSONS";
const schema = "jf01emailcz_2893";
import PG from "pg";

const client = new PG.Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  await client.connect();

  const getJsonById = async (id) => {
    const record = await client.query(
      `SELECT * FROM "${table}" WHERE id = $1 ORDER BY index DESC LIMIT 1`,
      [id]
    );
    assert(
      record.rows[0],
      "No data saved with this id yet, first save some using PUT method."
    );
    return record.rows[0].data;
  };

  // app.options('/')

  app.get("/latest/:id", async (req, res, next) => {
    try {
      assert(req.params.id, "You are missing id in the query");
      const latestSave = await getJsonById(req.params.id);
      res.send(latestSave);
      // res.json(JSON.parse(latestSave))
    } catch (e) {
      next(e);
    }
  });

  app.get("/all/:id", async (req, res, next) => {
    try {
      assert(req.params.id, "You are missing id in the query");
      const dbResponse = await client.query(
        `SELECT * FROM ${schema}."${table}" WHERE id = $1 ORDER BY index DESC`,
        [req.params.id]
      );
      if (!dbResponse.rowCount) {
        next(
          "No data saved with this id yet, first save some using PUT method."
        );
      }
      const responseMapped = dbResponse.rows.map((row) => {
        const newRow = { ...row };
        newRow.data = JSON.parse(newRow.data);
        return newRow;
      });
      res.json(responseMapped);
    } catch (e) {
      next(e);
    }
  });

  app.put("/:id", async (req, res, next) => {
    try {
      assert(req.params.id, "You are missing id in the query.");
      const dbResponse = await client.query(
        `INSERT INTO ${schema}."${table}"(id,data)
            VALUES ($1, $2);`,
        [req.params.id, req.body]
      );
      if (!dbResponse.rowCount) {
        next("No records saved for some unexpected reason, please try again.");
      }
      const latestSave = await getJsonById(req.query.id);

      res.json(JSON.parse(latestSave));
    } catch (e) {
      next(e);
    }
  });

  app.get("/", (req, res) => {
    res.status(200);
  });

  //all error handling
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({ error: err.message || err });
  });

  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
})();
