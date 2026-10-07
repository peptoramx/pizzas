import { defineConfig } from 'vite';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const scheduler=createRequire(require.resolve('react-dom')).resolve('scheduler');
// TypeScript transpilation also works in environments that prohibit child processes.
export default defineConfig({plugins:[{name:'typescript-transpile',enforce:'pre',transform(code,id){code=code.replaceAll('process.env.NODE_ENV','"production"');if(/\.(ts|tsx)$/.test(id))code=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},fileName:id}).outputText;return {code,map:null}}}],resolve:{preserveSymlinks:true,alias:{scheduler}},esbuild:false,build:{minify:false},base:'/pizzas/'});

