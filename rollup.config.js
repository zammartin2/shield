import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

// ESM сборка (для модулей)
const esmBuild = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.module.json',
      declaration: true,
      declarationDir: './dist/types',
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    }),
  ],
  external: [
    // Не бандлить зависимости
    /^node:/,
    // Добавьте зависимости, которые не должны быть в бандле
    // например: 'express', 'fastify', 'koa'
  ],
}

// CJS сборка (для CommonJS)
const cjsBuild = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false,
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    }),
  ],
  external: [
    /^node:/,
    // Добавьте зависимости
  ],
}

export default [esmBuild, cjsBuild]