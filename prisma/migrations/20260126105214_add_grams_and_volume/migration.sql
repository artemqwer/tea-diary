/*
  Warnings:

  - Added the required column `grams` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "steeps" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER NOT NULL,
    "grams" REAL NOT NULL,
    "teaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_teaId_fkey" FOREIGN KEY ("teaId") REFERENCES "Tea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("date", "duration", "id", "rating", "steeps", "teaId", "userId") SELECT "date", "duration", "id", "rating", "steeps", "teaId", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
