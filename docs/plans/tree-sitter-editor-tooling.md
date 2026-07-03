# Tree-sitter and Editor Tooling Plan

## Goal

Build `tree-sitter-veyr` as the source-of-truth editor grammar for Veyr `.vyr`
files. The grammar should support Helix directly through Tree-sitter parser
artifacts and query files, and leave a clean path for VSCode packaging.

The intended editor feature set includes:

- `highlights.scm`
- `indents.scm`
- `locals.scm`
- `tags.scm`
- `textobjects.scm`
- `folds.scm`
- local Helix grammar builds
- eventual VSCode extension packaging

## Language Authority

The grammar should follow the compiler implementation, not only the design docs.

Primary compiler references:

- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/lex/token.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/lex/lexer.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parser.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parse_item.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parse_stmt.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parse_expr.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parse_match.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/parse_impl.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/syntax/ast.vyr`

Corpus references:

- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/test/language-corpus/**/program.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/test/goldens/**/*.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/compiler/src/**/*.vyr`
- `~/Development/repos/codeberg.org/veyr-lang/veyr/lib/**/*.vyr`

## Current Language Facts

- Source extension is `.vyr`.
- Tree-sitter language name should be `veyr`.
- Scope should be `source.veyr`.
- Comments are `//` line comments. No block comments are currently implemented.
- Strings use double quotes and may contain interpolation holes like `{name}`.
- Character literals use single quotes.
- Integer literals support decimal, `0x`, `0b`, `0o`, and `_` separators.
- Float literals currently use `<digits>.<digits>`.
- Functions, structs, enums, unions, errors, traits, impls, constants, externs,
  modules, and imports are all part of the current syntax surface.

Several language words are contextual identifiers in the compiler rather than
dedicated lexer keywords. Tree-sitter can still parse them in context, but query
files should avoid blindly highlighting every same-named identifier as a keyword.

Contextual words include:

- `pub`
- `use`
- `module`
- `trait`
- `const`
- `extern`
- `ref`
- `ptr`
- `move`
- `defer`
- `unsafe`
- `catch`
- `step`
- `some`
- `none`
- `ok`
- `err`
- `Some`
- `None`
- `Ok`
- `Err`

## Grammar Scope

### Top-Level Items

Implement named nodes for:

- `source_file`
- `module_declaration`
- `use_declaration`
- `function_item`
- `extern_function_item`
- `const_item`
- `struct_item`
- `enum_item`
- `union_item`
- `error_item`
- `trait_item`
- `impl_item`

### Types and Generics

Support:

- primitive types: `bool`, `char`, `int`, `isize`, `int8`, `int16`, `int32`,
  `int64`, `int128`, `uint`, `usize`, `uint8`, `byte`, `uint16`, `uint32`,
  `uint64`, `uint128`, `float32`, `float64`, `str`, `String`, `unit`
- user type identifiers
- `Self`
- generic type parameters: `fn f[T]`, `struct Box[T]`
- generic bounds: `fn f[T: Bound]`
- generic type arguments: `Box[int]`, `Result[int, String]`
- nested generic types
- ref and pointer types: `ref T`, `mut ref T`, `ptr T`, `mut ptr T`
- slice and array band syntax such as `slice[T]` and `array[T, N]`

### Declarations

Support:

- functions with optional return type
- extern function declarations
- typed and untyped parameters
- trailing commas in parameter lists
- struct fields with optional defaults
- enum tuple payload variants
- union colon payload variants
- error declarations as payload-free enum-like declarations
- traits with methods, default method bodies, associated consts, associated types,
  and supertraits
- impl blocks for inherent methods, trait impls, scalar impls, concrete generic
  receiver impls, and generic receiver template impls

### Statements

Support:

- `let`
- `let mut`
- discard binding: `let _ = expr`
- assignment and compound assignment
- field assignment
- index assignment
- deref assignment: `p.* = value`
- `return`
- `print(expr)`
- `defer expr`
- `if` / `else` / `else if`
- `while`
- `loop`
- `for i in lower..upper`
- `for i in lower..upper step step_expr`
- `for i in value.indices`
- `for item in iterable`
- `break`
- `continue`
- `unsafe { ... }`
- expression statements

### Expressions

Support:

- literals
- unit literal `()`
- variables
- builtin Option/Result constructors
- enum constructors: `Enum.variant`, `Enum.variant(payload)`, `.variant`,
  `.variant(payload)`, `Option[int].Some(value)`
- struct literals, including field shorthand
- generic struct literals
- array literals
- calls
- named arguments
- generic calls
- method calls
- field access
- indexing
- deref reads: `p.*`
- try operator: `expr?`
- casts: `expr as Type`
- borrow expressions: `ref x`, `mut ref x`, `ptr x`, `mut ptr x`
- move expressions: `move x`
- if expressions
- match expressions
- catch suffixes: `expr catch { ... }`, `expr catch |e| { ... }`

### Operators

Support current precedence and associativity from the compiler:

- postfix: call, method call, field, index, `?`, `.*`
- unary: `!`, `~`, `ref`, `mut ref`, `ptr`, `mut ptr`
- cast: `as`
- multiply/divide: `*`, `/`
- add/subtract: `+`, `-`
- shift: `<<`, `>>`
- bitwise and: `&`
- bitwise xor: `^`
- bitwise or: `|`
- comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- logical and: `&&`
- logical or: `||`

Support assignment operators:

- `=`
- `+=`
- `-=`
- `*=`
- `/=`
- `&=`
- `|=`
- `^=`
- `<<=`
- `>>=`

### Match and Patterns

Support:

- match expression and statement positions
- expression arms
- block arms
- `=> return expr`
- `=> print(expr)`
- qualified patterns: `Enum.variant`
- dot shorthand: `.variant`
- builtin variant patterns: `some`, `none`, `ok`, `err`, `Some`, `None`, `Ok`,
  `Err`
- payload binding patterns
- wildcard payload patterns
- nested patterns such as `.ok(.some(x))`
- match guards: `.some(x) if x > 0 => ...`
- or-patterns: `.a | .b => ...`

## Key Grammar Ambiguities

Handle these deliberately in `grammar.js`:

- `name[Type](...)` generic call vs `value[index]` indexing.
- `Name[Type] { ... }` generic struct literal vs index expression.
- `Option[int].Some(x)` enum construction vs indexed value field access.
- `Ident { ... }` struct literal vs control-flow body delimiter.
- `|` as bitwise-or, or-pattern separator, and `catch |e|` binder.
- `.` as field access, method access, enum construction, dot pattern, module path,
  and part of `.*` deref.
- `..` as range and eventual slice range.
- Contextual keyword highlighting vs ordinary identifier use.

## Repository Bootstrap

Add the standard Tree-sitter package structure:

- `grammar.js`
- `tree-sitter.json`
- `package.json`
- package lockfile if using a Node package manager
- `src/parser.c`
- `src/node-types.json`
- `src/grammar.json`
- `src/tree_sitter/parser.h`
- optional `src/scanner.c` only if the grammar requires an external scanner
- `test/corpus/*.txt`
- `test/highlight/*.vyr`
- `examples/*.vyr`
- `queries/*.scm`
- `runtime/queries/veyr/*.scm` if maintaining a Helix runtime overlay

Generated parser artifacts should be committed because editor integrations need a
stable generated parser. Helix's compiled grammar shared object should not be
committed.

## Query Files

Canonical query files should live under `queries/`:

- `queries/highlights.scm`
- `queries/indents.scm`
- `queries/locals.scm`
- `queries/tags.scm`
- `queries/textobjects.scm`
- `queries/folds.scm`
- `queries/injections.scm` only if needed

Helix may consume a runtime overlay at:

- `runtime/queries/veyr/highlights.scm`
- `runtime/queries/veyr/indents.scm`
- `runtime/queries/veyr/locals.scm`
- `runtime/queries/veyr/tags.scm`
- `runtime/queries/veyr/textobjects.scm`
- `runtime/queries/veyr/folds.scm`

Prefer keeping one source of truth. If Helix-specific query behavior is needed,
document the divergence rather than silently maintaining two unrelated query sets.

## Helix Integration

Helix builds the grammar binary from the Tree-sitter parser source. The local
artifact is typically `runtime/grammars/veyr.so`; it should be treated as a build
artifact.

Example Helix language config:

```toml
[[language]]
name = "veyr"
scope = "source.veyr"
injection-regex = "veyr"
file-types = ["vyr"]
grammar = "veyr"
indent = { tab-width = 2, unit = "  " }

[[grammar]]
name = "veyr"
source = { path = "/home/zmeyer/Development/repos/codeberg.org/veyr-lang/tree-sitter-veyr" }
```

Prefer committing `.helix/languages.toml.example` rather than a machine-specific
absolute-path config unless this repository is intentionally workstation-local.

Local verification loop:

```sh
tree-sitter generate
tree-sitter test
HELIX_RUNTIME=/home/zmeyer/Development/repos/codeberg.org/veyr-lang/tree-sitter-veyr/runtime hx --grammar build
hx examples/example.vyr
```

## VSCode Strategy

VSCode does not consume Tree-sitter query files natively in the same way Helix
does.

Short-term options:

- Provide `language-configuration.json` and a simple TextMate grammar for baseline
  VSCode highlighting.
- Or package the Tree-sitter parser as WASM and implement semantic tokens in a
  VSCode extension.

Preferred long-term path:

- Build `tree-sitter-veyr.wasm`.
- Package query files with the extension.
- Implement semantic tokens, folding, document symbols, and selection behavior
  from Tree-sitter queries.

Likely VSCode extension files:

- `vscode/package.json`
- `vscode/src/extension.ts`
- `vscode/language-configuration.json`
- `vscode/parsers/tree-sitter-veyr.wasm`
- `vscode/queries/*.scm`
- `vscode/tsconfig.json`
- `vscode/.vscodeignore`

## Testing Strategy

Start with explicit corpus tests in `test/corpus/*.txt`, then add broad parse
smoke tests over real source.

Initial corpus coverage:

- module and use declarations
- simple functions and blocks
- let/return/assignment
- expression precedence
- structs and struct literals
- enums/unions/errors and enum constructors
- generics
- traits and impls
- match patterns, guards, and or-patterns
- unsafe/ref/ptr syntax
- arrays and indexing
- for loops and `step`
- string interpolation

Full parse smoke sources:

- compiler source files
- library files
- shared language corpus files
- golden test `.vyr` files

Once stable, CI should run:

```sh
tree-sitter generate --check
tree-sitter test
tree-sitter parse examples/*.vyr
```

Optionally add a local-only script that parse-smokes the external compiler repo.

## Next Implementation Slice: Nix Flake Environment

Update `flake.nix` before implementing the grammar so every machine gets the same
tooling.

Use `flake-parts` or `flake-utils` to support at least:

- `x86_64-linux`
- `aarch64-linux`
- `x86_64-darwin`
- `aarch64-darwin`

Development shell should provide:

- Node.js
- `nub` / `nubx`
- Tree-sitter CLI
- Helix for local grammar build testing if available on the platform
- VSCode extension packaging tools, likely `vsce` or an equivalent Node package
- formatting tools for JS/TS/Nix files
- linting tools for JS/TS/Nix files
- optional language-server tools for JS/TS/Nix work

The flake should package `nub` from platform-specific npm tarballs using version
`0.2.0` and the provided per-platform hashes.

`nub` package sketch:

```nix
nubVersion = "0.2.0";
nubSources = {
  x86_64-linux = {
    url = "https://registry.npmjs.org/@nubjs/nub-linux-x64/-/nub-linux-x64-${nubVersion}.tgz";
    hash = "sha512-dtS2XbRBqmHqTH+yYVW5sF/91GGyGCXXzAAONmB9BhLktwnMc387CLn8OkKCzHA4a28625nrrbtK9DC7hro8Rg==";
  };
  aarch64-linux = {
    url = "https://registry.npmjs.org/@nubjs/nub-linux-arm64/-/nub-linux-arm64-${nubVersion}.tgz";
    hash = "sha512-4NOJmPAIRuXIGbqTYWsOrGYxuac8Kfv/o5DXuwCWQ6TKr+R33kDnypOphQB54Pk1gmWP8cWW6feeThEKshGXOg==";
  };
  x86_64-darwin = {
    url = "https://registry.npmjs.org/@nubjs/nub-darwin-x64/-/nub-darwin-x64-${nubVersion}.tgz";
    hash = "sha512-Fvud/hsmnDnC4fNNH2IpipEmjsnEnqBqC48vZ3PGBqYfyPFzYtcqCPPJUTBXCNelO8Ivim3oP2C8refzYUXaZw==";
  };
  aarch64-darwin = {
    url = "https://registry.npmjs.org/@nubjs/nub-darwin-arm64/-/nub-darwin-arm64-${nubVersion}.tgz";
    hash = "sha512-/N7s012u3AV7ro38mz7V+TciLSsArHVmBg9Lr7YIPqaeJMgFJbYvzbf2Irkx3YEpdX///MrFHKv76bfGE/6DDg==";
  };
};
```

Acceptance criteria for the flake update:

- `nix develop` provides `node`, `nub`, `nubx`, and `tree-sitter`.
- `nix flake check` succeeds.
- The shell can run the future grammar commands without depending on global host
  packages.
- The flake works across the supported Linux and Darwin systems.

## Implementation Order

1. Update `flake.nix` for reproducible tooling.
2. Add Tree-sitter package metadata.
3. Implement initial grammar and generate parser artifacts.
4. Add parser corpus tests.
5. Add `highlights.scm` and `indents.scm` first for immediate Helix value.
6. Add `locals.scm`, `textobjects.scm`, `folds.scm`, and `tags.scm` after node
   names stabilize.
7. Add Helix example config and local verification instructions.
8. Add VSCode packaging after the Helix path is solid.
