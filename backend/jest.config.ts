import type { Config } from 'jest';
import { readFileSync } from 'node:fs';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

/**
 * @nestjs/* versi 12 hanya tersedia sebagai ESM, jadi Jest dijalankan dalam
 * mode ESM (`node --experimental-vm-modules`, lihat script `test`).
 */
const { config: tsconfig } = ts.readConfigFile('./tsconfig.json', (path) =>
  readFileSync(path, 'utf8'),
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          moduleResolution: 'bundler',
          target: 'es2023',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: ['apps/**/*.(t|j)s', 'libs/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
