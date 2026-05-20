import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^lit$": "<rootDir>/src/__mocks__/lit.ts",
    "^lit/decorators\\.js$": "<rootDir>/src/__mocks__/lit-decorators.ts",
    "^lit-html$": "<rootDir>/src/__mocks__/lit-html.ts",
    "^@lit/reactive-element$": "<rootDir>/src/__mocks__/reactive-element.ts",
  },
};