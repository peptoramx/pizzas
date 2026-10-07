import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
// Compile the same domain tests without launching subprocesses.
const directory=resolve('work-tests');mkdirSync(directory,{recursive:true});
for(const name of ['model','engine','sales','engine.test','sales.test']){let source=readFileSync(`src/domain/${name}.ts`,'utf8').replaceAll("from './model'","from './model.mjs'").replaceAll("from './engine'","from './engine.mjs'").replaceAll("from './sales'","from './sales.mjs'").replace("import {describe,it,expect} from 'vitest';",`import {describe,it} from 'node:test';import assert from 'node:assert/strict';const expect=(actual)=>({toBe:expected=>assert.equal(actual,expected),toHaveLength:expected=>assert.equal(actual.length,expected),toThrow:expected=>assert.throws(actual,typeof expected==='string'?new RegExp(expected):undefined)});`);writeFileSync(`${directory}/${name}.mjs`,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)}
await import(`file:///${directory.replaceAll('\\','/')}/engine.test.mjs`);


await import('file:///' + directory.replaceAll('\\', '/') + '/sales.test.mjs');

