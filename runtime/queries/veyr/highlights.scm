; Keywords

[
  "as"
  "catch"
  "const"
  "defer"
  "else"
  "enum"
  "error"
  "extern"
  "fn"
  "for"
  "if"
  "impl"
  "in"
  "let"
  "loop"
  "match"
  "module"
  "move"
  "mut"
  "print"
  "ptr"
  "ref"
  "return"
  "step"
  "struct"
  "trait"
  "type"
  "union"
  "unsafe"
  "use"
  "while"
] @keyword

(break_statement) @keyword
(continue_statement) @keyword
(visibility) @keyword.modifier

; Types and definitions

(struct_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(union_declaration name: (identifier) @type)
(error_declaration name: (identifier) @type)
(trait_declaration name: (identifier) @type)
(associated_type name: (identifier) @type)
(type_parameter name: (identifier) @type.parameter)

(type (identifier) @type)
(dotted_type (identifier) @type)
(generic_type name: (identifier) @type)

(struct_literal type: (identifier) @constructor)
(enum_variant name: (identifier) @constructor)
(dot_variant variant: (identifier) @constructor)
(dot_pattern variant: (identifier) @constructor)
(constructor_pattern variant: (identifier) @constructor)
(qualified_pattern path: (qualified_path (identifier) @constructor))

(const_declaration name: (identifier) @constant)
(associated_const name: (identifier) @constant)

; Functions and calls

(function_signature name: (identifier) @function)

(generic_call_expression function: (identifier) @function.call)
(call_expression function: (expression (variable (identifier) @function.call)))
(control_call_expression function: (non_struct_expression (variable (identifier) @function.call)))

(call_expression
  function: (expression
    (field_expression field: (identifier) @function.method.call)))

(control_call_expression
  function: (non_struct_expression
    (control_field_expression field: (identifier) @function.method.call)))

; Variables and fields

(parameter name: (identifier) @variable.parameter)
(parameter name: (self) @variable.builtin)
(let_statement name: (identifier) @variable)
(for_statement index: (identifier) @variable)
(for_statement value: (identifier) @variable)
(catch_clause error: (identifier) @variable)
(pattern_atom (identifier) @variable)

(variable (identifier) @variable)
(self) @variable.builtin
(wildcard) @variable.builtin

(field_declaration name: (identifier) @variable.member)
(struct_field_initializer name: (identifier) @variable.member)
(struct_field_initializer (identifier) @variable.member)
(field_expression field: (identifier) @variable.member)
(control_field_expression field: (identifier) @variable.member)
(indexed_field_expression field: (identifier) @variable.member)
(control_indexed_field_expression field: (identifier) @variable.member)
(argument name: (identifier) @variable.parameter)

; Modules

(module_declaration path: (dotted_path (identifier) @module))
(use_tree (identifier) @module)
(use_declaration alias: (identifier) @module)

; Literals

(boolean_literal) @boolean
(integer_literal) @number
(float_literal) @number.float
(char_literal) @constant.character
(string_literal) @string
(unit_literal) @constant.builtin

; Comments

(comment) @comment

; Operators and punctuation

[
  "!"
  "!="
  "&"
  "&&"
  "&="
  "*"
  "*="
  "+"
  "+="
  "-"
  "-="
  "->"
  ".."
  "/"
  "/="
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  "=>"
  ">"
  ">="
  ">>"
  ">>="
  "?"
  "^"
  "^="
  "|"
  "|="
  "||"
  "~"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  "."
  ":"
] @punctuation.delimiter
