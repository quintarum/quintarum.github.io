---
inclusion: always
---

# TypeScript-Only Policy

## Overview

This project follows a **strict TypeScript-only policy**. All code must be written in TypeScript, with no JavaScript files in the codebase.

## Rules

### ✅ Required

1. **All source code** must be TypeScript (`.ts`, `.tsx`)
2. **All scripts** must be TypeScript (use `tsx` for execution)
3. **Type annotations** must be explicit for function parameters and return values
4. **Strict mode** must be enabled in tsconfig.json
5. **No `any` types** unless absolutely necessary (use `unknown` instead)

### ❌ Prohibited

1. **No JavaScript files** (`.js`, `.jsx`) in:
   - `src/` directory
   - `scripts/` directory
   - Any new code additions
2. **No implicit `any`** types
3. **No type assertions** without justification
4. **No `@ts-ignore`** or `@ts-nocheck` comments (fix the issue instead)

## Script Execution

### Using tsx

All TypeScript scripts should be executed with `tsx`:

```bash
# Direct execution
tsx scripts/my-script.ts

# With arguments
tsx scripts/my-script.ts --option value

# In package.json
"scripts": {
  "my-script": "tsx scripts/my-script.ts"
}
```

### Script Template

```typescript
#!/usr/bin/env tsx

/**
 * Script Description
 * 
 * Usage: npm run script-name
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
  // Define your interfaces
}

async function main(): Promise<void> {
  // Your script logic
}

main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Error:', errorMessage);
  process.exit(1);
});
```

## Type Safety Guidelines

### Function Signatures

```typescript
// ✅ Good - explicit types
function calculateEnergy(node: Node, neighbors: Node[]): number {
  // ...
}

// ❌ Bad - implicit any
function calculateEnergy(node, neighbors) {
  // ...
}
```

### Interfaces vs Types

```typescript
// ✅ Prefer interfaces for object shapes
interface NodeState {
  position: { x: number; y: number };
  energy: number;
}

// ✅ Use type aliases for unions/intersections
type NodeStatus = 'symmetric' | 'broken' | 'anomaly';
type ExtendedNode = Node & { metadata: Record<string, unknown> };
```

### Error Handling

```typescript
// ✅ Good - proper error typing
try {
  // ...
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Error:', errorMessage);
}

// ❌ Bad - implicit any
try {
  // ...
} catch (error) {
  console.error(error.message); // error is 'any'
}
```

### Null Safety

```typescript
// ✅ Good - explicit null checks
function getNode(id: string): Node | null {
  // ...
}

const node = getNode('123');
if (node !== null) {
  node.update();
}

// ✅ Good - optional chaining
node?.update();

// ✅ Good - nullish coalescing
const energy = node?.energy ?? 0;
```

## Migration from JavaScript

If you encounter JavaScript files that need to be converted:

1. Rename `.js` to `.ts`
2. Add explicit type annotations
3. Fix any type errors
4. Update imports to use `.js` extension (Vite requirement)
5. Test thoroughly

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint

```javascript
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
    }
  }
];
```

## Benefits

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-Documenting**: Types serve as inline documentation
4. **Easier Refactoring**: Compiler catches breaking changes
5. **Consistency**: Single language across entire codebase

## Exceptions

The only acceptable non-TypeScript files are:

- Configuration files that require JavaScript (e.g., `vite.config.ts` can be TS)
- Package.json and other JSON files
- Markdown documentation
- CSS/HTML files
- Asset files (images, fonts, etc.)

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [tsx Documentation](https://github.com/privatenumber/tsx)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)

## Enforcement

- Pre-commit hooks check for `.js` files in `src/` and `scripts/`
- CI/CD pipeline runs `tsc --noEmit` to verify type correctness
- ESLint enforces TypeScript-specific rules
- Code reviews reject JavaScript submissions
