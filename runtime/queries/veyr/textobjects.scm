(function_declaration body: (block) @function.inside) @function.around
(extern_function_declaration) @function.around

(trait_member
  (function_signature) @function.inside) @function.around

(struct_declaration body: (field_declaration_block) @class.inside) @class.around
(enum_declaration body: (enum_variant_block) @class.inside) @class.around
(union_declaration body: (field_declaration_block) @class.inside) @class.around
(error_declaration body: (enum_variant_block) @class.inside) @class.around
(trait_declaration body: (trait_body) @class.inside) @class.around
(impl_declaration body: (impl_body) @class.inside) @class.around

(parameter) @parameter.inside
(parameter) @parameter.around
(argument) @parameter.inside
(argument) @parameter.around

(field_declaration) @entry.inside
(field_declaration) @entry.around
(enum_variant) @entry.inside
(enum_variant) @entry.around
(match_arm) @entry.inside
(match_arm) @entry.around

(comment) @comment.inside
(comment) @comment.around
