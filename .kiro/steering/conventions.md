# Code Conventions

## TypeScript Style

### Type Annotations
- Always provide explicit return types for functions
- Use interfaces for object shapes and public APIs
- Use type aliases for unions, intersections, and utility types
- Prefer `interface` over `type` for extensibility

```typescript
// Good
interface NodeState {
  position: { x: number; y: number };
  energy: number;
  state: 'symmetric' | 'broken' | 'anomaly';
}

function calculateEnergy(node: Node): number {
  // ...
}

// Avoid
function calculateEnergy(node) {
  // ...
}
```

### Enums
- Use string enums for better debugging and serialization
- Use PascalCase for enum names, UPPER_CASE for values

```typescript
enum NodeState {
  SYMMETRIC = 'symmetric',
  BROKEN = 'broken',
  ANOMALY = 'anomaly'
}
```

### Null Safety
- Use strict null checks
- Prefer optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid `any` type - use `unknown` if type is truly unknown

### Class Design
- Use readonly for immutable properties
- Prefer private fields with `#` prefix for true privacy
- Document public methods with JSDoc comments
- Use constructor parameter properties for concise initialization

```typescript
class Simulation {
  readonly lattice: Lattice;
  #history: SimulationState[] = [];
  
  constructor(
    lattice: Lattice,
    private params: SimulationParams
  ) {
    this.lattice = lattice;
  }
}
```

## Code Style

### Formatting (Prettier)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- 100 character line width
- Trailing commas in ES5 contexts
- Arrow function parens: avoid when possible

### Naming Conventions
- **Classes**: PascalCase (`Simulation`, `Renderer2D`)
- **Functions/Methods**: camelCase (`calculateEntropy`, `updateNode`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HISTORY_DEPTH`)
- **Private fields**: `#fieldName` or `_fieldName` prefix
- **Interfaces**: PascalCase, no `I` prefix (`NodeState`, not `INodeState`)
- **Type aliases**: PascalCase (`SimulationParams`)

### Comments
- Use JSDoc for public APIs and complex functions
- Include `@param`, `@returns`, `@throws` where applicable
- Keep inline comments concise and meaningful
- Explain "why", not "what" (code should be self-documenting)

```typescript
/**
 * Calculate entropy of the lattice system
 * @param lattice - The lattice to analyze
 * @returns Entropy value (0-1 normalized)
 */
function calculateEntropy(lattice: Lattice): number {
  // Implementation
}
```

## ESLint Rules

- `no-unused-vars`: warn (allow `_` prefix for intentionally unused)
- `no-console`: warn (allow `console.warn` and `console.error`)
- `prefer-const`: error
- `no-var`: error
- Use `let` and `const`, never `var`

## Module Organization

### File Structure
```typescript
// 1. Imports (external first, then internal)
import { Chart } from 'chart.js';
import { Lattice } from './Lattice.js';

// 2. Type definitions and interfaces
interface SimulationParams {
  // ...
}

// 3. Constants
const DEFAULT_PARAMS = { /* ... */ };

// 4. Main class/function
export class Simulation {
  // ...
}

// 5. Helper functions (if any)
function helperFunction() {
  // ...
}
```

### Imports
- Always use `.js` extension in imports (Vite/TS requirement)
- Group imports: libraries, then local modules
- Use named imports, avoid `import *`
- One import statement per module

```typescript
// Good
import { Lattice } from './core/Lattice.js';
import { Physics } from './core/Physics.js';

// Avoid
import * as Core from './core/index.js';
```

## Best Practices

- Keep functions small and focused (single responsibility)
- Prefer composition over inheritance
- Use pure functions where possible (especially in Physics module)
- Avoid side effects in calculations
- Use callbacks/events for component communication
- Validate inputs at API boundaries
- Handle errors gracefully with try-catch
- Use optional parameters with default values
- Prefer immutability - avoid mutating parameters
