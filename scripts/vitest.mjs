// Arranca o Vitest com a letra da drive em maiúscula (ex.: C:\ em vez de c:\).
//
// No Windows, se o terminal abrir a pasta como "c:\Projectos\...", o Vitest
// carrega-se duas vezes e todos os testes falham com
// "Cannot read properties of undefined (reading 'config')".
// Este script corrige a pasta atual e depois arranca o Vitest normalmente,
// com os mesmos argumentos (ex.: "run").
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const pasta = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase())
process.chdir(pasta)

await import(pathToFileURL(join(pasta, 'node_modules', 'vitest', 'vitest.mjs')).href)
