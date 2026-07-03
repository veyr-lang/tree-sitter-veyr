# tree-sitter-veyr

Tree-sitter grammar and editor queries for Veyr `.vyr` files.

## Development

Enter the pinned toolchain with:

```sh
nix develop
```

Useful commands:

```sh
tree-sitter generate
tree-sitter test
tree-sitter parse test/highlight/*.vyr
```

## Helix

Create project-local Helix configuration from the example and replace the grammar
path with this repo's absolute path. The active config file is ignored because
the path is machine-specific:

```sh
cp .helix/languages.toml.example .helix/languages.toml
```

Build the grammar and expose this repo's Helix query files through Helix's user
runtime:

```sh
hx --grammar build
mkdir -p ~/.config/helix/runtime/queries
ln -sfn "$PWD/runtime/queries/veyr" ~/.config/helix/runtime/queries/veyr
hx --health veyr
hx test/highlight/empty.vyr
```

The build writes `~/.config/helix/runtime/grammars/veyr.so` locally. Do not
commit compiled grammar binaries.

The generated parser sources under `src/` should be committed once the grammar is
implemented. Locally compiled editor grammar binaries, such as
`runtime/grammars/veyr.so`, should not be committed.

## Updating syntax

Veyr is pre-1.0, so the compiler parser is the source of truth for syntax. When
the language changes, update this grammar in the same slice:

1. Add or update a compiler `.vyr` example that shows the syntax.
2. Add the same shape to this repo's Tree-sitter corpus or highlight fixtures.
3. Update `grammar.js` and any affected files in `queries/`.
4. Run `tree-sitter generate`, `tree-sitter test`, and parse the representative
   fixtures.

Generated parser sources under `src/` are committed so downstream editor users do
not need the generator. Locally built grammar binaries remain ignored.
