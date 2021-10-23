import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import bodyParser from 'body-parser'
import assert from 'assert'
import cors from 'cors'

//idcka +
const app = express()
app.use(bodyParser.json())

const corsOptions = {
	origin: '*',
	methods: ['GET', 'DELETE', 'PUT', 'OPTIONS'],
	allowedHeaders: ['Content-Type']
	
}

// app.use(cors(corsOptions))
app.use((req, res, next) => {
	res.set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE',
		'Access-Control-Allow-Headers': 'Content-Type,Accept,Accept-Encoding,Accept-Language,Connection,Content-Length,Origin'
	})
	next()
})


const port = process.env.PORT || 3000
const table = process.env.TABLE || 'JSONS'
import PG from 'pg'

const client = new PG.Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
})

;(async () => {
	await client.connect()
	console.log('database connected')

	const getJsonById = async id => {
		const record = await client.query(
			`SELECT * FROM public."${table}" WHERE id = $1 ORDER BY index DESC LIMIT 1`,
			[id],
		)
		assert(
			record.rows[0],
			'No data saved with this id yet, first save some using PUT method.',
		)
		return record.rows[0].data
	}

	app.get('/', async (req, res, next) => {
		try {
			assert(req.query.id, 'You are missing id in the query')
			const latestSave = await getJsonById(req.query.id)
			res.json(JSON.parse(latestSave))
		} catch (e) {
			next(e)
		}
	})

	app.get('/get-all', async (req, res, next) => {
		try {
			assert(req.query.id, 'You are missing id in the query')
			const dbResponse = await client.query(
				`SELECT * FROM public."${table}" WHERE id = $1 ORDER BY index DESC`,
				[req.query.id],
			)
			if (!dbResponse.rowCount) {
				next(
					'No data saved with this id yet, first save some using PUT method.',
				)
			}
			const responseMapped = dbResponse.rows.map(row => {
				const newRow = { ...row }
				newRow.data = JSON.parse(newRow.data)
				return newRow
			})
			res.json(responseMapped)
		} catch (e) {
			next(e)
		}
	})

	app.post('/', async (req, res, next) => {
		try {
			assert(req.query.id, 'You are missing id in the query.')
			const dbResponse = await client.query(
				`INSERT INTO public."${table}"(id,data)
            VALUES ($1, $2);`,
				[req.query.id, JSON.stringify(req.body)],
			)
			if (!dbResponse.rowCount) {
				next('No records saved for some unexpected reason, please try again.')
			}
			const latestSave = await getJsonById(req.query.id)
			
			res.send(JSON.parse(latestSave))
		} catch (e) {
			next(e)
		}
	})

	app.delete(
		'/really-clean-all-records-without-backup',
		async (_req, res, next) => {
			try {
				const dbResponse = await client.query(
					`DELETE FROM public."${table}"; ALTER SEQUENCE public."${table}_id_seq" RESTART WITH 1;`,
				)
				res.send({
					deletedRows: dbResponse.find(item => {
						return item.command == 'DELETE'
					}).rowCount,
				})
			} catch (e) {
				next(e)
			}
		},
	)

	//all error handling
	app.use(function (err, req, res, next) {
		res.status(err.status || 500).send({ error: err.message || err })
	})

	app.listen(port, () => {
		console.log(`app listening at http://localhost:${port}`)
	})
})()
