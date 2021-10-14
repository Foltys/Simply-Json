import express from 'express'
import bodyParser from 'body-parser'
const app = express()
app.use(bodyParser.json())
const port = process.env.PORT | 3000
import PG from 'pg'

const client = new PG.Client({
	connectionString:
		'postgres://hcklvgsanxtzdt:48e55e4258ceebe092136db6031dff3c6852256cad8e64e9dbb5be7e61b1a9c8@ec2-52-205-45-219.compute-1.amazonaws.com:5432/ddk026cb3as7re',
	ssl: {
		rejectUnauthorized: false,
	},
})

;(async () => {
	await client.connect()
	console.log('database connected')

	app.get('/', async (req, res) => {
		try {
			const dbResponse = await client.query(
				'SELECT * FROM public."Test" ORDER BY id DESC LIMIT 1',
			)
			res.send(dbResponse.rows)
		} catch (e) {
			res.send(e)
		}
	})

	app.get('/get-all', async (req, res) => {
		try {
			const dbResponse = await client.query(
				'SELECT * FROM public."Test" ORDER BY id DESC',
			)
			res.send(dbResponse.rows)
		} catch (e) {
			res.send(e)
		}
	})

	app.put('/', async (req, res) => {
		try {
			const dbResponse = await client.query(
				`INSERT INTO public."Test"(
            record)
            VALUES ($1);`,
				[JSON.stringify(req.body)],
			)
			res.send(dbResponse)
		} catch (e) {
			res.send(e)
		}
	})

	app.listen(port, () => {
		console.log(`app listening at http://localhost:${port}`)
	})
})()
