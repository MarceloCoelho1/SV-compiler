import { TokenType } from "./tokenType";

export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpr"
  | "_return"
  | "VariableDeclaration"
  | "String"
  | "Semicolon"
  | "Block"
  | "Parameter"
  | "FunctionDeclaration"
  | "FunctionCall"
  | "While"
  | "If"
  | "UnaryExpr"
  | "Char"
  | "FloatLiteral"
  | "SwitchStmt"
  | "CaseStmt"
  | "DefaultStmt"
  | "CloseCurlyBrace"
  | "ForStmt"
  | "DoubleLiteral"

/**
 * Statements do not result in a value at runtime.
 They contain one or more expressions internally */
export interface Stmt  {
  kind: NodeType;
}

/**
 * Defines a block which contains many statements.
 * -  Only one program will be contained in a file.
 */
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

/**  Expressions will result in a value at runtime unlike Statements */
export interface Expr extends Stmt {}

/**
 * A operation with two sides separated by a operator.
 * Both sides can be ANY Complex Expression.
 * - Supported Operators -> + | - | / | * | %
 */
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: TokenType; // needs to be of type BinaryOperator
}

// LITERAL / PRIMARY EXPRESSION TYPES
/**
 * Represents a user-defined variable or symbol in source.
 */
export interface Identifier extends Expr {
  kind: "Identifier";
  type: TokenType;
  symbol: string;
}

export interface _return extends Stmt {
  kind: '_return';
  expression: Expr | null;
}

/**
 * Represents a numeric constant inside the source code.
 */
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface FloatLiteral extends Expr {
  kind: "FloatLiteral";
  value: number;
}

export interface DoubleLiteral extends Expr {
  kind: "DoubleLiteral";
  value: number;
}

export interface VariableDeclaration extends Stmt {
  kind: "VariableDeclaration";
  identifier: Identifier;
  type: TokenType | null;
  initializer: Expr | null;
}

export interface String extends Stmt {
  kind: "String";
  symbol: string;
}

export interface Char extends Stmt {
  kind: "Char";
  symbol: string;
}

export interface Semicolon extends Stmt {
  kind: "Semicolon";
  symbol: string;
}

export interface Block extends Stmt {
  kind: "Block";
  statements: Stmt[];
}

export interface Parameter extends Expr {
  kind: "Parameter";
  identifier: Stmt;
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  identifier: Identifier;
  parameters: Parameter[];
  body: Block;
}

export interface FunctionCall extends Expr {
  kind: "FunctionCall";
  identifier: Identifier;
  arguments: Expr[];
}

export interface While extends Stmt {
  kind: "While";
  condition: Expr;
  body: Block;
}

export interface If extends Stmt {
  kind: "If";
  condition: Expr;
  thenBranch: Block;
  elseBranch?: Block | null;
}

export interface UnaryExpr {
  kind: "UnaryExpr";
  operator: TokenType.PlusPlus | TokenType.MinusMinus;
}

// Adicionando a definição para SwitchStmt
export interface SwitchStmt extends Stmt {
  kind: "SwitchStmt";
  expression: Expr;
  cases: CaseStmt[];
  default?: Block | null;
}

export interface CaseStmt extends Stmt {
  kind: "CaseStmt";
  value: Expr;
  body: Stmt[];
}

export interface DefaultStmt extends Stmt {
  kind: "DefaultStmt";
  body: Stmt[];
}

export interface ForStmt extends Stmt {
  kind: "ForStmt";
  initialization: VariableDeclaration | Expr | null;
  condition: Expr | null;
  increment: Expr | null;
  body: Block;
}

