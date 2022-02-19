import { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
	testEnvironment: 'node',
	testTimeout: 5000,
	projects: [
		{
			displayName: 'png',
			testMatch: ['<rootDir>/src/png/tests/**/*.spec.ts'],
			transform: {
				'^.+\\.tsx?$': 'ts-jest',
			},
		},
		{
			displayName: 'bmp',
			testMatch: ['<rootDir>/src/bmp/tests/**/*.spec.ts'],
			transform: {
				'^.+\\.tsx?$': 'ts-jest',
			},
		},
	],
};

export default config;
