// deno-lint-ignore-file no-explicit-any
import { error } from "node:console";
import {
    BinaryExpr,
    Expr,
    Identifier,
    NumericLiteral,
    Program,
    Semicolon,
    Stmt,
    String,
    VariableDeclaration,
    _return,
    Block,
    FunctionDeclaration,
    Parameter,
    FunctionCall,
    While,
    If,
    UnaryExpr

} from "./ast";

import { Token, TokenType } from "./tokenType";



/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
    private tokens: Token[] = [];

    private not_eof(): boolean {
        return this.tokens[0].type !== TokenType.EOF;
    }

    private at(): Token {
        return this.tokens[0] as Token;
    }

    private eat(): Token {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TokenType, err: any): Token {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type !== type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            process.exit();
        }

        return prev;
    }

    public produceAST(_tokens: Array<Token>): Program {
        this.tokens = _tokens;
        const program: Program = {
            kind: "Program",
            body: [],
        };

        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        return program;
    }

    private parse_block(): Block {
        this.expect(TokenType.OpenCurlyBrace, "Expecting '{' to start a block.");

        const statements: Stmt[] = [];

        // Parse statements inside the block
        while (this.at().type !== TokenType.CloseCurlyBrace && this.not_eof()) {
            statements.push(this.parse_stmt());
        }

        this.expect(TokenType.CloseCurlyBrace, "Expecting '}' to end a block.");

        return {
            kind: "Block",
            statements,
        };
    }

    private parse_while(): While {
        this.expect(TokenType.While, "Expecting 'while' keyword.");

        const condition = this.parse_expr();
        const body = this.parse_block();

        return {
            kind: "While",
            condition,
            body,
        };
    }

    private parse_if(): If {
        this.expect(TokenType.If, "Expecting 'if' keyword.");

        const condition = this.parse_expr();
        const thenBranch = this.parse_block();

        let elseBranch: Block | null = null;
        if (this.at().type === TokenType.Else) {
            this.eat();
            elseBranch = this.parse_block();
        }

        return {
            kind: "If",
            condition,
            thenBranch,
            elseBranch,
        };
    }

    private parse_function_declaration(): FunctionDeclaration {
        this.expect(TokenType.Function, "Expecting 'function' keyword.");

        const identifier = this.parse_identifier();
        this.expect(TokenType.OpenParen, "Expecting '(' after function identifier.");

        const parameters: Parameter[] = [];
        while (this.at().type === TokenType.Identifier) {
            parameters.push({
                kind: "Parameter",
                identifier: this.parse_identifier(),
            });

            if (this.at().type === TokenType.Comma) {
                this.eat();
            }
        }

        this.expect(TokenType.CloseParen, "Expecting ')' after function parameters.");

        const body = this.parse_block();

        return {
            kind: "FunctionDeclaration",
            identifier,
            parameters,
            body,
        };
    }

    private parse_stmt(): Stmt {
        if (this.at().type === TokenType.Sv) {
            this.eat();
            const identifier = this.parse_identifier();
            if (this.at().value === '=') {
                this.eat();
                const initializer = this.parse_expr();
                if (this.at().type !== TokenType.Semi) {
                    console.error('Invalid syntax, missing Semicolon symbol');
                    process.exit();
                }
                this.eat();
                return {
                    kind: "VariableDeclaration",
                    identifier,
                    initializer,
                } as VariableDeclaration;
            } else {
                if (this.at().type !== TokenType.Semi) {
                    console.error('Invalid syntax, missing Semicolon symbol');
                    process.exit();
                }
                this.eat();
                return {
                    kind: "VariableDeclaration",
                    identifier,
                    initializer: null,
                } as VariableDeclaration;
            }
        } else if (this.at().type === TokenType.Semi) {
            this.eat();
            return { kind: "Semicolon", symbol: ';' } as Semicolon;
        } else if (this.at().type === TokenType.Function) {
            return this.parse_function_declaration();
        } else if (this.at().type === TokenType.While) {
            return this.parse_while();
        } else if (this.at().type === TokenType.If) {
            return this.parse_if();
        } else if (this.at().type === TokenType.OpenCurlyBrace) {
            // Parse block
            return this.parse_block();
        }

        return this.parse_expr();
    }

    private parse_identifier(): Identifier {
        return {
            kind: "Identifier",
            symbol: this.eat().value,
        } as Identifier;
    }

    private parse_expr(): Expr {
        return this.parse_additive_expr();
    }

    private parse_unary_expr(): Expr {
        const tk = this.at().type;
    
        if (tk === TokenType.PlusPlus || tk === TokenType.MinusMinus) {
            const operator = this.eat().type;
            const operand = this.parse_primary_expr();
            return {
                kind: "UnaryExpr",
                operator,
                operand,
            } as UnaryExpr;
        } else if (tk === TokenType.Identifier && this.tokens[1]?.type === TokenType.MinusMinus) {
            // Handle -- as a unary operator
            const identifier = this.parse_identifier();
            this.eat(); // Consume --
            return {
                kind: "UnaryExpr",
                operator: TokenType.MinusMinus,
                operand: identifier,
            } as UnaryExpr;
        }
    
        return this.parse_primary_expr();
    }

    private parse_additive_expr(): Expr {
        let left = this.parse_multiplicative_expr();
    
        while (
            this.at().type === TokenType.Plus ||
            this.at().type === TokenType.Minus ||
            this.at().type === TokenType.PlusEquals ||
            this.at().type === TokenType.MinusEquals ||
            this.at().type === TokenType.PlusPlus ||
            this.at().type === TokenType.MinusMinus
        ) {
            const operator = this.eat().type;
            let right: Expr;
    
            if (operator === TokenType.PlusPlus || operator === TokenType.MinusMinus) {
                // Handle ++ and -- as unary operators
                right = {
                    kind: "UnaryExpr",
                    operator,
                    
                } as Expr;
            } else {
                // Handle other binary operators
                right = this.parse_multiplicative_expr();
            }
    
            left = {
                kind: "BinaryExpr",
                left,
                right,
            } as BinaryExpr;
    
            // Check for optional semicolon
            if (this.at().type === TokenType.Semi) {
                this.eat(); // Consume the semicolon
            }
        }
    
        return left;
    }

    private parse_multiplicative_expr(): Expr {
        let left = this.parse_primary_expr();

        while (
            this.at().type === TokenType.Star ||
            this.at().type === TokenType.Slash ||
            this.at().type === TokenType.Percent ||
            this.at().type === TokenType.StarEquals ||
            this.at().type === TokenType.SlashEquals
        ) {
            const operator = this.eat().type;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_function_call(identifier: Identifier): FunctionCall {
        this.expect(TokenType.OpenParen, "Expecting '(' after function identifier.");

        const args: Expr[] = [];

        while (this.at().type !== TokenType.CloseParen) {
            args.push(this.parse_expr());

            if (this.at().type === TokenType.Comma) {
                this.eat();
            }
        }

        this.expect(TokenType.CloseParen, "Expecting ')' after function arguments.");

        return {
            kind: "FunctionCall",
            identifier,
            arguments: args,
        };
    }

    private parse_primary_expr(): Expr {
        const tk = this.at().type;
        const symbol = this.at().value
        console.log(symbol);
        switch (tk) {
            case TokenType.Identifier:
                const identifier = this.parse_identifier();

                if (this.at().type === TokenType.OpenParen) {
                    return this.parse_function_call(identifier);
                }
                return identifier;

            case TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value),
                } as NumericLiteral;

            case TokenType.MinusMinus:
            case TokenType.PlusPlus:
                const operator = this.eat().type;
                const operand = this.parse_primary_expr();
                return {
                    kind: "UnaryExpr",
                    operator,
                    operand,
                } as UnaryExpr;

            case TokenType.OpenParen: {
                this.eat();
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesized expression. Expected closing parenthesis.");
                return value;
            }

            case TokenType._return: {
                this.eat();
                if (this.at().type === TokenType.Semi) {
                    return { kind: "_return", expression: null } as _return;
                } else {
                    const expression = this.parse_expr();
                    return { kind: "_return", expression } as _return;
                }
            }

            case TokenType.String:
                return { kind: "String", symbol: this.eat().value } as String;
            case TokenType.Semi:
                return { kind: "Semicolon" }; 
            default:
                console.error("Unexpected token found during parsing!", this.at());
                process.exit();
        }
    }
}