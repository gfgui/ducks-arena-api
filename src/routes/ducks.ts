import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { getRandomDuckImage } from '../utils/getRandomDuckImage.js'
import protobuf from 'protobufjs'
import path from 'path'

const prisma = new PrismaClient()

export async function patoRoutes(fastify: FastifyInstance) {
  fastify.post('/patos', async (request, reply) => {
    const { nome } = request.body as { nome: string }
    const imagem = await getRandomDuckImage()

    const pato = await prisma.pato.create({
      data: {
        nome,
        ataque: Math.floor(Math.random() * 50 + 50),
        defesa: Math.floor(Math.random() * 50),
        vida: 100,
        imagem
      }
    })

    return reply.code(201).send(pato)
  })

  const root = await protobuf.load(path.resolve(__dirname, '../proto/pato.proto'))
  const PatosResponse = root.lookupType('PatosResponse')

  fastify.get('/patos', async (request, reply) => {

    const patos = await prisma.pato.findMany()

    const message = PatosResponse.create({ patos })

    const buffer = PatosResponse.encode(message).finish()

    reply
      .header('Content-Type', 'application/x-protobuf')
      .send(buffer)
  })

  fastify.get('/patos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const pato = await prisma.pato.findUnique({ where: { id: Number(id) } })
    if (!pato) return reply.code(404).send({ error: 'Pato não encontrado' })
    return pato
  })

  fastify.put('/patos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { nome } = request.body as { nome: string }

    try {
      const pato = await prisma.pato.update({
        where: { id: Number(id) },
        data: { nome }
      })
      return pato
    } catch {
      return reply.code(404).send({ error: 'Pato não encontrado' })
    }
  })

  fastify.delete('/patos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.pato.delete({ where: { id: Number(id) } })
      return reply.code(204).send()
    } catch {
      return reply.code(404).send({ error: 'Pato não encontrado' })
    }
  })

  fastify.post('/patos/batalha', async (_, reply) => {
    const patos = await prisma.pato.findMany()

    if (patos.length < 2) {
      return reply.code(400).send({ message: 'É necessário pelo menos 2 patos para batalhar.' })
    }

    // Seleciona dois patos diferentes aleatoriamente
    let atacanteIndex = Math.floor(Math.random() * patos.length)
    let defensorIndex: number

    do {
      defensorIndex = Math.floor(Math.random() * patos.length)
    } while (defensorIndex === atacanteIndex)

    const atacante = patos[atacanteIndex]
    let defensor = patos[defensorIndex]

    const dano = Math.max(0, atacante.ataque - defensor.defesa)
    const novaVida = defensor.vida - dano

    let mensagem = `${atacante.nome} atacou ${defensor.nome} causando ${dano} de dano.`

    if (novaVida <= 0) {
      await prisma.pato.delete({ where: { id: defensor.id } })
      mensagem += ` ${defensor.nome} foi derrotado e removido do jogo.`
      defensor = { ...defensor, vida: 0 } // Para mostrar no retorno
    } else {
      defensor = await prisma.pato.update({
        where: { id: defensor.id },
        data: { vida: novaVida }
      })
    }

    return reply.send({
      mensagem,
      atacante,
      defensor
    })
  })
}
