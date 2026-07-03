/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
	range: 1,
	logical_or: 2,
	logical_and: 3,
	compare: 4,
	bitwise_or: 5,
	bitwise_xor: 6,
	bitwise_and: 7,
	shift: 8,
	add: 9,
	multiply: 10,
	cast: 11,
	unary: 12,
	postfix: 13,
	call: 14,
	primary: 15,
	generic: 16,
};

module.exports = grammar({
	name: "veyr",

	word: ($) => $.identifier,

	extras: ($) => [$.comment, /\s/],

	conflicts: ($) => [[$.type, $.variable]],

	rules: {
		source_file: ($) => repeat($._top_level_item),

		_top_level_item: ($) =>
			choice(
				$.module_declaration,
				$.use_declaration,
				$.const_declaration,
				$.extern_function_declaration,
				$.function_declaration,
				$.struct_declaration,
				$.enum_declaration,
				$.union_declaration,
				$.error_declaration,
				$.trait_declaration,
				$.impl_declaration,
			),

		visibility: () => "pub",

		module_declaration: ($) => seq("module", field("path", $.dotted_path)),

		use_declaration: ($) =>
			seq(
				"use",
				field("path", $.use_tree),
				optional(seq("as", field("alias", $.identifier))),
			),

		use_tree: ($) =>
			seq(
				optional("."),
				$.identifier,
				repeat(seq(".", choice($.identifier, $.use_group))),
			),

		use_group: ($) => seq("{", commaSep($.identifier), optional(","), "}"),

		const_declaration: ($) =>
			seq(
				optional($.visibility),
				"const",
				field("name", $.identifier),
				optional(seq(":", field("type", $.type))),
				"=",
				field("value", $.expression),
			),

		extern_function_declaration: ($) =>
			seq(optional($.visibility), "extern", $.function_signature),

		function_declaration: ($) =>
			seq(optional($.visibility), $.function_signature, field("body", $.block)),

		function_signature: ($) =>
			seq(
				"fn",
				field("name", $.identifier),
				optional($.type_parameters),
				$.parameter_list,
				optional($.return_type),
			),

		return_type: ($) => seq("->", field("type", $.type)),

		parameter_list: ($) => seq("(", commaSep($.parameter), optional(","), ")"),

		parameter: ($) =>
			seq(
				field("name", choice($.identifier, $.self, $.wildcard)),
				optional(seq(":", field("type", $.type))),
			),

		type_parameters: ($) =>
			seq("[", commaSep1($.type_parameter), optional(","), "]"),

		type_parameter: ($) =>
			seq(
				field("name", $.identifier),
				optional(seq(":", field("bound", $.type_bound))),
			),

		type_bound: ($) => sep1($.type, "+"),

		struct_declaration: ($) =>
			seq(
				optional($.visibility),
				"struct",
				field("name", $.identifier),
				optional($.type_parameters),
				field("body", $.field_declaration_block),
			),

		field_declaration_block: ($) =>
			seq("{", repeat(seq($.field_declaration, optional(","))), "}"),

		field_declaration: ($) =>
			seq(
				field("name", $.identifier),
				":",
				field("type", $.type),
				optional(seq("=", field("default", $.expression))),
			),

		enum_declaration: ($) =>
			seq(
				optional($.visibility),
				"enum",
				field("name", $.identifier),
				optional($.type_parameters),
				field("body", $.enum_variant_block),
			),

		union_declaration: ($) =>
			seq(
				optional($.visibility),
				"union",
				field("name", $.identifier),
				optional($.type_parameters),
				field("body", $.field_declaration_block),
			),

		error_declaration: ($) =>
			seq(
				optional($.visibility),
				"error",
				field("name", $.identifier),
				field("body", $.enum_variant_block),
			),

		enum_variant_block: ($) =>
			seq("{", repeat(seq($.enum_variant, optional(","))), "}"),

		enum_variant: ($) =>
			seq(
				field("name", $.identifier),
				optional(seq("(", field("payload", $.type), ")")),
			),

		trait_declaration: ($) =>
			seq(
				optional($.visibility),
				"trait",
				field("name", $.identifier),
				optional($.type_parameters),
				optional($.supertraits),
				field("body", $.trait_body),
			),

		supertraits: ($) => seq(":", sep1($.type, "+")),

		trait_body: ($) => seq("{", repeat($.trait_member), "}"),

		trait_member: ($) =>
			choice(
				seq($.function_signature, field("body", $.block)),
				$.function_signature,
				$.associated_const,
				$.associated_type,
			),

		impl_declaration: ($) =>
			seq(
				"impl",
				field("target", $.type),
				optional(seq("for", field("receiver", $.type))),
				field("body", $.impl_body),
			),

		impl_body: ($) => seq("{", repeat($.impl_member), "}"),

		impl_member: ($) =>
			choice($.function_declaration, $.associated_const, $.associated_type),

		associated_const: ($) =>
			seq(
				"const",
				field("name", $.identifier),
				":",
				field("type", $.type),
				optional(seq("=", field("value", $.expression))),
			),

		associated_type: ($) =>
			seq(
				"type",
				field("name", $.identifier),
				optional(seq("=", field("type", $.type))),
			),

		type: ($) =>
			choice(
				$.reference_type,
				$.pointer_type,
				$.generic_type,
				$.dotted_type,
				$.identifier,
			),

		reference_type: ($) => seq(optional("mut"), "ref", field("type", $.type)),

		pointer_type: ($) => seq(optional("mut"), "ptr", field("type", $.type)),

		generic_type: ($) => seq(field("name", $.identifier), $.type_argument_list),

		type_argument_list: ($) =>
			seq(
				"[",
				commaSep1(choice($.type, $.integer_literal)),
				optional(","),
				"]",
			),

		dotted_type: ($) => seq($.identifier, repeat1(seq(".", $.identifier))),

		block: ($) => seq("{", repeat($._statement), "}"),

		_statement: ($) =>
			choice(
				$.let_statement,
				$.return_statement,
				$.print_statement,
				$.if_statement,
				$.while_statement,
				$.loop_statement,
				$.for_statement,
				$.break_statement,
				$.continue_statement,
				$.unsafe_block,
				$.defer_statement,
				$.assignment_statement,
				$.expression_statement,
			),

		let_statement: ($) =>
			seq(
				"let",
				optional("mut"),
				field("name", choice($.identifier, $.wildcard)),
				optional(seq(":", field("type", $.type))),
				"=",
				field("value", $.expression),
				optional($.catch_clause),
			),

		catch_clause: ($) =>
			seq(
				"catch",
				optional(
					seq("|", field("error", choice($.identifier, $.wildcard)), "|"),
				),
				field("body", $.block),
			),

		return_statement: ($) => seq("return", $.expression),

		print_statement: ($) => seq("print", $.argument_list),

		if_statement: ($) =>
			prec(
				1,
				seq(
					"if",
					field("condition", $.non_struct_expression),
					field("consequence", $.block),
					optional(
						seq("else", field("alternative", choice($.block, $.if_statement))),
					),
				),
			),

		while_statement: ($) =>
			seq(
				"while",
				field("condition", $.non_struct_expression),
				field("body", $.block),
			),

		loop_statement: ($) => seq("loop", field("body", $.block)),

		for_statement: ($) =>
			seq(
				"for",
				field("index", $.identifier),
				optional(seq(",", field("value", $.identifier))),
				"in",
				field("iterable", $.non_struct_expression),
				optional(seq("step", field("step", $.expression))),
				field("body", $.block),
			),

		break_statement: () => "break",

		continue_statement: () => "continue",

		unsafe_block: ($) => seq("unsafe", field("body", $.block)),

		defer_statement: ($) => seq("defer", field("value", $.expression)),

		assignment_statement: ($) =>
			seq(
				field("left", $.assignable_expression),
				field("operator", $.assignment_operator),
				field("right", $.expression),
			),

		assignable_expression: ($) =>
			choice(
				$.identifier,
				$.field_expression,
				$.index_expression,
				$.dereference_expression,
			),

		assignment_operator: () =>
			choice("=", "+=", "-=", "*=", "/=", "&=", "|=", "^=", "<<=", ">>="),

		expression_statement: ($) => $.expression,

		expression: ($) =>
			choice(
				$.if_expression,
				$.match_expression,
				$.move_expression,
				$.binary_expression,
				$.cast_expression,
				$.unary_expression,
				$.try_expression,
				$.generic_call_expression,
				$.generic_field_expression,
				$.indexed_field_expression,
				$.call_expression,
				$.field_expression,
				$.dereference_expression,
				$.index_expression,
				$.struct_literal,
				$.array_literal,
				$.dot_variant,
				$.unit_literal,
				$.parenthesized_expression,
				$.literal,
				$.variable,
			),

		non_struct_expression: ($) =>
			choice(
				$.control_move_expression,
				$.control_binary_expression,
				$.control_cast_expression,
				$.control_unary_expression,
				$.control_try_expression,
				$.generic_call_expression,
				$.generic_field_expression,
				$.control_indexed_field_expression,
				$.control_call_expression,
				$.control_field_expression,
				$.control_dereference_expression,
				$.control_index_expression,
				$.array_literal,
				$.dot_variant,
				$.unit_literal,
				$.control_parenthesized_expression,
				$.literal,
				$.variable,
			),

		control_move_expression: ($) =>
			prec(PREC.unary, seq("move", field("value", $.non_struct_expression))),

		control_unary_expression: ($) =>
			prec(
				PREC.unary,
				choice(
					seq(
						field("operator", choice("!", "~")),
						field("value", $.non_struct_expression),
					),
					seq("ref", field("value", $.non_struct_expression)),
					seq("mut", "ref", field("value", $.non_struct_expression)),
					seq("ptr", field("value", $.non_struct_expression)),
					seq("mut", "ptr", field("value", $.non_struct_expression)),
				),
			),

		control_cast_expression: ($) =>
			prec.left(
				PREC.cast,
				seq(
					field("value", $.non_struct_expression),
					"as",
					field("type", $.identifier),
				),
			),

		control_binary_expression: ($) =>
			choice(
				controlBinary($, PREC.range, ".."),
				controlBinary($, PREC.logical_or, "||"),
				controlBinary($, PREC.logical_and, "&&"),
				controlBinary(
					$,
					PREC.compare,
					choice("==", "!=", "<", ">", "<=", ">="),
				),
				controlBinary($, PREC.bitwise_or, "|"),
				controlBinary($, PREC.bitwise_xor, "^"),
				controlBinary($, PREC.bitwise_and, "&"),
				controlBinary($, PREC.shift, choice("<<", ">>")),
				controlBinary($, PREC.add, choice("+", "-")),
				controlBinary($, PREC.multiply, choice("*", "/")),
			),

		control_try_expression: ($) =>
			prec.left(
				PREC.postfix,
				seq(field("value", $.non_struct_expression), "?"),
			),

		control_call_expression: ($) =>
			prec.left(
				PREC.call,
				seq(
					field("function", $.non_struct_expression),
					field("arguments", $.argument_list),
				),
			),

		control_field_expression: ($) =>
			prec.left(
				PREC.postfix,
				seq(
					field("receiver", $.non_struct_expression),
					".",
					field("field", $.identifier),
				),
			),

		control_indexed_field_expression: ($) =>
			prec.left(
				PREC.generic,
				seq(
					field("collection", $.identifier),
					"[",
					field("index", choice($.literal, $.variable)),
					"]",
					".",
					field("field", $.identifier),
				),
			),

		control_dereference_expression: ($) =>
			prec.left(
				PREC.postfix,
				seq(field("receiver", $.non_struct_expression), ".", "*"),
			),

		control_index_expression: ($) =>
			prec.left(
				PREC.call,
				seq(
					field("collection", $.non_struct_expression),
					"[",
					field("index", $.expression),
					"]",
				),
			),

		control_parenthesized_expression: ($) =>
			seq("(", $.non_struct_expression, ")"),

		if_expression: ($) =>
			seq(
				"if",
				field("condition", $.non_struct_expression),
				field("consequence", $.block),
				"else",
				field("alternative", choice($.block, $.if_expression)),
			),

		match_expression: ($) =>
			seq(
				"match",
				field("value", $.non_struct_expression),
				field("body", $.match_block),
			),

		match_block: ($) => seq("{", repeat(seq($.match_arm, optional(","))), "}"),

		match_arm: ($) =>
			seq(
				field("pattern", $.pattern),
				optional(seq("if", field("guard", $.expression))),
				"=>",
				field(
					"body",
					choice($.block, $.return_statement, $.print_statement, $.expression),
				),
			),

		pattern: ($) => choice($.or_pattern, $.pattern_atom),

		or_pattern: ($) => seq($.pattern_atom, repeat1(seq("|", $.pattern_atom))),

		pattern_atom: ($) =>
			choice(
				$.wildcard,
				$.dot_pattern,
				$.qualified_pattern,
				$.constructor_pattern,
				$.identifier,
			),

		dot_pattern: ($) =>
			seq(".", field("variant", $.identifier), optional($.pattern_payload)),

		qualified_pattern: ($) =>
			seq(field("path", $.qualified_path), optional($.pattern_payload)),

		constructor_pattern: ($) =>
			seq(field("variant", $.identifier), $.pattern_payload),

		pattern_payload: ($) => seq("(", field("pattern", $.pattern), ")"),

		move_expression: ($) =>
			prec(PREC.unary, seq("move", field("value", $.expression))),

		unary_expression: ($) =>
			prec(
				PREC.unary,
				choice(
					seq(
						field("operator", choice("!", "~")),
						field("value", $.expression),
					),
					seq("ref", field("value", $.expression)),
					seq("mut", "ref", field("value", $.expression)),
					seq("ptr", field("value", $.expression)),
					seq("mut", "ptr", field("value", $.expression)),
				),
			),

		cast_expression: ($) =>
			prec.left(
				PREC.cast,
				seq(field("value", $.expression), "as", field("type", $.identifier)),
			),

		binary_expression: ($) =>
			choice(
				binary($, PREC.range, ".."),
				binary($, PREC.logical_or, "||"),
				binary($, PREC.logical_and, "&&"),
				binary($, PREC.compare, choice("==", "!=", "<", ">", "<=", ">=")),
				binary($, PREC.bitwise_or, "|"),
				binary($, PREC.bitwise_xor, "^"),
				binary($, PREC.bitwise_and, "&"),
				binary($, PREC.shift, choice("<<", ">>")),
				binary($, PREC.add, choice("+", "-")),
				binary($, PREC.multiply, choice("*", "/")),
			),

		try_expression: ($) =>
			prec.left(PREC.postfix, seq(field("value", $.expression), "?")),

		call_expression: ($) =>
			prec.left(
				PREC.call,
				seq(
					field("function", $.expression),
					field("arguments", $.argument_list),
				),
			),

		generic_call_expression: ($) =>
			prec.left(
				PREC.generic,
				seq(
					field("function", $.identifier),
					$.generic_argument_list,
					field("arguments", $.argument_list),
				),
			),

		argument_list: ($) => seq("(", commaSep($.argument), optional(","), ")"),

		argument: ($) =>
			choice(seq(field("name", $.identifier), ":", $.expression), $.expression),

		field_expression: ($) =>
			prec.left(
				PREC.postfix,
				seq(field("receiver", $.expression), ".", field("field", $.identifier)),
			),

		generic_field_expression: ($) =>
			prec.left(
				PREC.generic,
				seq(
					field("receiver", $.identifier),
					$.generic_argument_list,
					".",
					field("field", $.identifier),
				),
			),

		indexed_field_expression: ($) =>
			prec.left(
				PREC.generic,
				seq(
					field("collection", $.identifier),
					"[",
					field("index", choice($.literal, $.variable)),
					"]",
					".",
					field("field", $.identifier),
				),
			),

		dereference_expression: ($) =>
			prec.left(PREC.postfix, seq(field("receiver", $.expression), ".", "*")),

		index_expression: ($) =>
			prec.left(
				PREC.call,
				seq(
					field("collection", $.expression),
					"[",
					field("index", $.expression),
					"]",
				),
			),

		struct_literal: ($) =>
			prec(
				PREC.generic,
				choice(
					seq(
						field("type", $.identifier),
						$.generic_argument_list,
						field("body", $.struct_literal_body),
					),
					seq(
						field("type", $.identifier),
						field("body", $.struct_literal_body),
					),
				),
			),

		struct_literal_body: ($) =>
			seq("{", commaSep($.struct_field_initializer), optional(","), "}"),

		struct_field_initializer: ($) =>
			choice(seq(field("name", $.identifier), ":", $.expression), $.identifier),

		array_literal: ($) => seq("[", commaSep($.expression), optional(","), "]"),

		dot_variant: ($) =>
			prec(PREC.primary, seq(".", field("variant", $.identifier))),

		generic_argument_list: ($) =>
			seq("[", commaSep1($.type), optional(","), "]"),

		unit_literal: () => seq("(", ")"),

		parenthesized_expression: ($) => seq("(", $.expression, ")"),

		literal: ($) =>
			choice(
				$.float_literal,
				$.integer_literal,
				$.char_literal,
				$.string_literal,
				$.boolean_literal,
			),

		boolean_literal: () => choice("true", "false"),

		variable: ($) => $.identifier,

		integer_literal: () =>
			token(choice(/0x[0-9a-fA-F_]+/, /0b[01_]+/, /0o[0-7_]+/, /[0-9][0-9_]*/)),

		float_literal: () => token(/[0-9]+\.[0-9]+/),

		char_literal: () =>
			token(seq("'", repeat(choice(/[^'\\]/, /\\./)), optional("'"))),

		string_literal: () =>
			token(seq('"', repeat(choice(/[^"\\]/, /\\./)), optional('"'))),

		self: () => "self",

		wildcard: () => "_",

		dotted_path: ($) => seq($.identifier, repeat(seq(".", $.identifier))),

		qualified_path: ($) => seq($.identifier, repeat1(seq(".", $.identifier))),

		identifier: () => token(/[A-Za-z][A-Za-z0-9_]*|_[A-Za-z0-9_]+/),

		comment: () => token(seq("//", /[^\n]*/)),
	},
});

function binary($, precedence, operator) {
	return prec.left(
		precedence,
		seq(
			field("left", $.expression),
			field("operator", operator),
			field("right", $.expression),
		),
	);
}

function controlBinary($, precedence, operator) {
	return prec.left(
		precedence,
		seq(
			field("left", $.non_struct_expression),
			field("operator", operator),
			field("right", $.non_struct_expression),
		),
	);
}

function commaSep(rule) {
	return optional(commaSep1(rule));
}

function commaSep1(rule) {
	return seq(rule, repeat(seq(",", rule)));
}

function sep1(rule, separator) {
	return seq(rule, repeat(seq(separator, rule)));
}
