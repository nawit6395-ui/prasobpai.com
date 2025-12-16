const ReactTiptap = require('@tiptap/react');
console.log('Exports from @tiptap/react:', Object.keys(ReactTiptap));

try {
    const packageJson = require('./node_modules/@tiptap/react/package.json');
    console.log('Installed version:', packageJson.version);
} catch (e) {
    console.log('Could not read package.json');
}
