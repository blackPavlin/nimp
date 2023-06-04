import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
	testEnvironment: 'node',
	testTimeout: 5000,
	projects: [
		{
			displayName: 'png',
			testMatch: ['<rootDir>/src/png/tests/**/*.spec.ts'],
			extensionsToTreatAsEsm: ['.ts'],
			moduleNameMapper: {
				'^(\\.{1,2}/.*)\\.js$': '$1',
			},
			transform: {
				'^.+\\.m?[tj]sx?$': ['ts-jest', { useESM: true }],
			},
		},
	],
};

export default config;
