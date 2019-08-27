# sincronia-server

This project houses the source code for the Sincronia scoped app. Feel free to contribute 🐙

## Configuration

The configuration for this project is optimized for TypeScript. It employs two plugins to do that.

### @sincronia/typescript-plugin

This plugin is configured to only typecheck the source code. This prevents type errors and various other easy mistakes.

### @sincronia/babel-plugin

Babel does all the transforming of code in this project. It strips the import/export statements when it gets pushed to ServiceNow and safely transpiles the TypeScript code to ServiceNow-compatible javascript.
