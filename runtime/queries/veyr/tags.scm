(function_declaration
  (function_signature name: (identifier) @name)) @definition.function

(extern_function_declaration
  (function_signature name: (identifier) @name)) @definition.function

(trait_member
  (function_signature name: (identifier) @name)) @definition.method

(impl_member
  (function_declaration
    (function_signature name: (identifier) @name))) @definition.method

(struct_declaration name: (identifier) @name) @definition.struct
(enum_declaration name: (identifier) @name) @definition.enum
(union_declaration name: (identifier) @name) @definition.union
(error_declaration name: (identifier) @name) @definition.enum
(trait_declaration name: (identifier) @name) @definition.interface
(const_declaration name: (identifier) @name) @definition.constant
(associated_const name: (identifier) @name) @definition.constant
(associated_type name: (identifier) @name) @definition.type
(field_declaration name: (identifier) @name) @definition.field
(enum_variant name: (identifier) @name) @definition.variant

(generic_call_expression function: (identifier) @name) @reference.call
(call_expression function: (expression (variable (identifier) @name))) @reference.call
(control_call_expression function: (non_struct_expression (variable (identifier) @name))) @reference.call
