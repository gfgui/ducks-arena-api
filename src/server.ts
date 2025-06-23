import Fastify from 'fastify'
import { patoRoutes } from './routes/ducks'
import 'dotenv/config'
import cors from '@fastify/cors'
import protobuf from 'protobufjs'

const app = Fastify({ logger: true })

app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })

app.register(patoRoutes)

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Servidor rodando em ${address}`)
})
