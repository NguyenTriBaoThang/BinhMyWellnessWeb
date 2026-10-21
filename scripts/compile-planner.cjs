const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'src/lib/planner/engine.ts');
const output = path.join(os.tmpdir(), 'binh-my-du-ky-test-build/engine.js');
const source = fs.readFileSync(input, 'utf8');
const result = ts.transpileModule(source, {
  fileName: input,
  reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, strict: true, esModuleInterop: true },
});
const errors = (result.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
if (errors.length) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(errors, {
    getCurrentDirectory: () => root,
    getCanonicalFileName: (name) => name,
    getNewLine: () => '\n',
  }));
  process.exit(1);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, result.outputText);
