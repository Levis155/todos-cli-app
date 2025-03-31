-- CreateTable
CREATE TABLE "todos_table" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "todos_table_pkey" PRIMARY KEY ("id")
);
