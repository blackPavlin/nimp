import { basename, extname, join } from 'node:path';
import { snapshot } from 'node:test';

snapshot.setResolveSnapshotPath(generateSnapshotPath);

/**
 * @param {string} testFilePath '/tmp/foo.test.js'
 * @returns {string} '/tmp/foo.test.cjs'
 */
function generateSnapshotPath(testFilePath) {
    const ext = extname(testFilePath);
    const filename = basename(testFilePath, ext);

    return join(import.meta.dirname, 'snapshots' ,`${filename}.cjs`);
}
