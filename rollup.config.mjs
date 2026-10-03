import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

// ќбщие внешние зависимости (не бандлим)
const external = [
  /^node:/,
  // Peer-зависимости Ч не должны попадать в бандл,
  // их устанавливает пользователь.
  'express',
  'fastify',
  'koa',
]

// ќбщие плагины (без typescript Ч он разный дл€ CJS/ESM)
const commonPlugins = [
  nodeResolve({ preferBuiltins: true }),
  commonjs(),
]

// ћинификаци€ Ч м€гка€, чтобы не убить рантайм-логи
const minify = terser({
  compress: {
    // Ќ≈ удал€ем console.* Ч библиотека использует warn/error в рантайме
    drop_console: false,
    drop_debugger: true,
    passes: 2,
  },
  mangle: {
    // Ќе трогаем имена классов и методов Ч иначе поломаютс€
    // инстансы, наследование и динамический доступ
    keep_classnames: true,
    keep_fnames: true,
  },
  format: {
    comments: false,
  },
})

// ESM сборка
const esmBuild = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true,
    exports: 'named',
  },
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.module.json',
      // ƒекларации генерирует отдельный шаг build:types,
      // здесь их не дублируем
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      inlineSources: true,
    }),
    minify,
  ],
  external,
  // Ќе предупреждать про circular deps, если они контролируемые
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if (warning.code === 'THIS_IS_UNDEFINED') return
    warn(warning)
  },
}

// CJS сборка
const cjsBuild = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
    // Ќе превращать default export в module.exports целиком
    esModule: true,
  },
  plugins: [
    ...commonPlugins,
    typescript({
      tsconfig: './tsconfig.module.json',
      compilerOptions: {
        module: 'ESNext',
      },
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      inlineSources: true,
    }),
    minify,
  ],
  external,
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if (warning.code === 'THIS_IS_UNDEFINED') return
    warn(warning)
  },
}

export default [esmBuild, cjsBuild]