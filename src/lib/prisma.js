"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@/generated/prisma/client");
var extension_accelerate_1 = require("@prisma/extension-accelerate");
var prisma = new client_1.PrismaClient().$extends((0, extension_accelerate_1.withAccelerate)());
var notes = await prisma.note.findMany({ cacheStrategy: { swr: 60, ttl: 60 } });
console.log(notes);
