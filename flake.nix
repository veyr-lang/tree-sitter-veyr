{
  description = "Tree-sitter grammar and editor tooling for Veyr";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs systems;

      pkgsFor =
        system:
        import nixpkgs {
          inherit system;
        };
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
          inherit (pkgs) lib stdenv;

          nubVersion = "0.2.10";
          nubSources = {
            x86_64-linux = {
              url = "https://registry.npmjs.org/@nubjs/nub-linux-x64/-/nub-linux-x64-${nubVersion}.tgz";
              hash = "sha256-BC6jc3lDbJz7nqkixvV9pwUyKKR+VzsFU7wzAXiIdG4=";
            };
            aarch64-linux = {
              url = "https://registry.npmjs.org/@nubjs/nub-linux-arm64/-/nub-linux-arm64-${nubVersion}.tgz";
              hash = "sha256-kFUfuOfUb4Q3KC1KyZOB2ZtNDT207dfL+IJ/Ox1H8Rg=";
            };
            x86_64-darwin = {
              url = "https://registry.npmjs.org/@nubjs/nub-darwin-x64/-/nub-darwin-x64-${nubVersion}.tgz";
              hash = "sha256-v96fnoj0SHYEga7m7sbNcI8LOeLrdndwegB+ghuAco0=";
            };
            aarch64-darwin = {
              url = "https://registry.npmjs.org/@nubjs/nub-darwin-arm64/-/nub-darwin-arm64-${nubVersion}.tgz";
              hash = "sha256-tgbUFH2pbhcSK+TQ/AnGW7PHHwY47jcmjq6/6SDWEfg=";
            };
          };

          nub = stdenv.mkDerivation {
            pname = "nub";
            version = nubVersion;

            src = pkgs.fetchurl nubSources.${system};
            sourceRoot = "package";

            nativeBuildInputs = lib.optionals stdenv.isLinux [ pkgs.autoPatchelfHook ];
            buildInputs = lib.optionals stdenv.isLinux [
              stdenv.cc.cc.lib
              pkgs.glibc
            ];

            dontConfigure = true;
            dontBuild = true;

            installPhase = ''
              runHook preInstall

              mkdir -p $out
              cp -R bin $out/
              chmod +x $out/bin/nub $out/bin/nubx

              runHook postInstall
            '';

            meta = {
              description = "All-in-one Rust toolkit for Node.js projects";
              homepage = "https://nubjs.com/docs";
              license = lib.licenses.mit;
              mainProgram = "nub";
              platforms = builtins.attrNames nubSources;
            };
          };
        in
        {
          inherit nub;
          default = nub;
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
          nub = self.packages.${system}.nub;
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              biome
              deadnix
              helix
              nil
              nixfmt
              nodejs_22
              nub
              statix
              stdenv.cc
              tree-sitter
              typescript
              typescript-language-server
              vsce
            ];

            shellHook = ''
              export TREE_SITTER_DIR="$PWD/.tree-sitter"
            '';
          };
        }
      );

      formatter = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        pkgs.writeShellApplication {
          name = "tree-sitter-veyr-format";
          runtimeInputs = [ pkgs.nixfmt ];
          text = ''
            if [ "$#" -eq 0 ]; then
              nixfmt flake.nix
            else
              nixfmt "$@"
            fi
          '';
        }
      );

      checks = forAllSystems (system: {
        nub = self.packages.${system}.nub;
      });
    };
}
