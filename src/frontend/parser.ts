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
} from "./ast";

import { Token, TokenType } from "./tokenType";

/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
    private tokens: Token[] = [];

    /*
     * Determines if the parsing is complete and the END OF FILE Is reached.
     */
    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    /**
     * Returns the currently available token
     */
    private at() {
        return this.tokens[0] as Token;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
     */
    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
     *  Also checks the type of expected token and throws if the values dnot match.
     */
    private expect(type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            process.exit();
        }

        return prev;
    }

    public produceAST(_tokens: Array<Token>): Program {
        this.tokens = _tokens
        const program: Program = {
            kind: "Program",
            body: [],
        };

        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        return program;
    }

    // Handle complex statement types
    private parse_stmt(): Stmt {
        // skip to parse_expr
        if (this.at().type === TokenType.Sv) {
            this.eat()
            const identifier = this.parse_identifier()
            if (this.at().value === '=') {
                this.eat()
                const initializer = this.parse_expr()
                if(this.at().type !== TokenType.Semi) {
                    console.error('Invalid syntax, missing Semicolon symbol')
                    process.exit()
                }
                this.eat()
                return {
                    kind: "VariableDeclaration",
                    identifier,
                    initializer
                } as VariableDeclaration
            } else {
                if(this.at().type !== TokenType.Semi) {
                    console.error('Invalid syntax, missing Semicolon symbol')
                    process.exit()
                }
                this.eat()
                return {
                    kind: "VariableDeclaration",
                    identifier,
                    initializer: null
                } as VariableDeclaration
            }
        } else if(this.at().type === TokenType.Semi) {
            return {kind: "Semicolon", symbol: this.eat().value} as Semicolon
        }
        return this.parse_expr();
    }

    private parse_identifier(): Identifier {
        return {
            kind: "Identifier",
            symbol: this.eat().value
        } as Identifier
    }

    // Handle expressions
    private parse_expr(): Expr {
        return this.parse_additive_expr();
    }

    // Handle Addition & Subtraction Operations
    private parse_additive_expr(): Expr {
        let left = this.parse_multiplicitave_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicitave_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    // Handle Multiplication, Division & Modulo Operations
    private parse_multiplicitave_expr(): Expr {
        let left = this.parse_primary_expr();

        while (
            this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
        ) {
            const operator = this.eat().value;
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

    // Orders Of Prescidence
    // AdditiveExpr
    // MultiplicitaveExpr
    // PrimaryExpr

    // Parse Literal Values & Grouping Expressions
    private parse_primary_expr(): Expr {
        const tk = this.at().type;
      
        // Determine which token we are currently at and return the appropriate AST node
        switch (tk) {
          // User-defined values.
          case TokenType.Identifier:
            return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      
          // Constants and Numeric Constants
          case TokenType.Number:
            return {
              kind: "NumericLiteral",
              value: parseFloat(this.eat().value),
            } as NumericLiteral;
      
          // Grouping Expressions
          case TokenType.OpenParen: {
            this.eat(); // Eat the opening paren
            const value = this.parse_expr();
            this.expect(
              TokenType.CloseParen,
              "Unexpected token found inside parenthesized expression. Expected closing parenthesis.",
            ); // Closing paren
            return value;
          }
      
          case TokenType._return: {
            this.eat(); // Eat the 'return' keyword
            if (this.at().type === TokenType.Semi) {
              // 'return' statement without an expression
              return { kind: "_return", expression: null } as _return;
            } else {
              // 'return' statement with an expression
              const expression = this.parse_expr();
              return { kind: "_return", expression } as _return;
            }
          }
      
          case TokenType.String:
            return { kind: "String", symbol: this.eat().value } as String;
      
          // Unidentified Tokens and Invalid Code Reached
          default:
            console.error("Unexpected token found during parsing!", this.at());
            process.exit();
        }
      }
      
}