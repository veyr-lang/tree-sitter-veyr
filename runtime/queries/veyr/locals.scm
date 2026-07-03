[
  (source_file)
  (block)
  (function_declaration)
  (trait_member)
  (impl_member)
  (match_arm)
  (for_statement)
  (catch_clause)
] @local.scope

(function_signature name: (identifier) @local.definition.function)
(parameter name: (identifier) @local.definition.parameter)
(parameter name: (self) @local.definition.parameter)
(let_statement name: (identifier) @local.definition.variable)
(for_statement index: (identifier) @local.definition.variable)
(for_statement value: (identifier) @local.definition.variable)
(catch_clause error: (identifier) @local.definition.variable)
(type_parameter name: (identifier) @local.definition.type)
(pattern_atom (identifier) @local.definition.variable)

(variable (identifier) @local.reference)
(self) @local.reference
