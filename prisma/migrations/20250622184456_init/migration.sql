-- CreateTable
CREATE TABLE "Pato" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ataque" INTEGER NOT NULL,
    "defesa" INTEGER NOT NULL,
    "vida" INTEGER NOT NULL,
    "imagem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pato_pkey" PRIMARY KEY ("id")
);
