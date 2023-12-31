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
    _return,
    Block,
    FunctionDeclaration,
    Parameter,
    FunctionCall,
    While,
    If,
    UnaryExpr,
    VariableDeclaration,
    Char,
    FloatLiteral,
    CaseStmt,
    SwitchStmt,
    DefaultStmt,
    ForStmt,
    DoubleLiteral,
    VectorDeclaration
} from "./ast";

import { Token, TokenType } from "./tokenType";



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
        this.expect(
            TokenType.OpenParen,
            "Expecting '(' after function identifier."
        );
        const parameters: Parameter[] = [];
        while (this.at().type !== TokenType.CloseParen) {
            parameters.push({
                kind: "Parameter",
                identifier: this.parse_function_declaration_parameters(),
            });

            if (this.at().type === TokenType.Comma) {
                this.eat();
            }
        }

        this.expect(
            TokenType.CloseParen,
            "Expecting ')' after function parameters."
        );

        const body = this.parse_block();

        return {
            kind: "FunctionDeclaration",
            identifier,
            parameters,
            body,
        };
    }

    private parse_function_declaration_parameters(): Identifier {
        if (
            this.at().type === TokenType.bool ||
            this.at().type === TokenType.String ||
            this.at().type === TokenType.float ||
            this.at().type === TokenType.int ||
            this.at().type === TokenType.char ||
            this.at().type === TokenType.Double
        ) {
            const type = this.eat().type;
            const symbol = this.expect(TokenType.Identifier, "Expecting an identifier after the type.").value;

            return {
                kind: "Identifier",
                type,
                symbol,
            } as Identifier;
        } else {
            console.error("Parameter variable type is not correct", this.at().value);
            process.exit();
        }
    }

    private parse_switch(): SwitchStmt {
        this.expect(TokenType.Switch, "Expecting 'switch' keyword.");
    
        const expression = this.parse_expr();
        this.expect(TokenType.OpenCurlyBrace, "Expecting '{' to start a switch block.");
    
        const cases: CaseStmt[] = [];
        let defaultCase: Stmt[] | null = null;
        while (this.at().type !== TokenType.CloseCurlyBrace) {
            if (this.at().type === TokenType.Case) {
                this.eat();
                const value = this.parse_expr();
                this.expect(TokenType.Colon, "Expecting ':' after case expression.");
                const body: Stmt[] = [];

                while (this.at().type !== TokenType.Break) {
                    body.push(this.parse_stmt());
                }
                this.eat();
                this.eat();
                cases.push({
                    kind: "CaseStmt",
                    value,
                    body,
                });
            } else if (this.at().type === TokenType.Default) {
                this.eat();
                this.expect(TokenType.Colon, "Expecting ':' after 'default' keyword.");
                const body: Stmt[] = [];
                while (this.at().type !== TokenType.Break) {
                    body.push(this.parse_stmt());
                }
                this.eat();
                this.eat();
                defaultCase = body;

                
            } 
        }
        // eat the closeCurlyBrace
        this.eat();
        return {
            kind: "SwitchStmt",
            expression,
            cases,
            default: defaultCase,
        } as SwitchStmt;
    }

    private parse_for(): ForStmt {
        this.expect(TokenType.For, "Expecting 'for' keyword.");
    
        this.expect(TokenType.OpenParen, "Expecting '(' after 'for' keyword.");
    
        // Parse initialization
        let initialization: VariableDeclaration | Expr | null = null;
        if (this.at().type !== TokenType.Semi) {
            initialization = this.parse_stmt() as VariableDeclaration | Expr;
        }


        // Parse condition
        let condition: Expr | null = this.parse_for_condition();
        this.expect(TokenType.Semi, "Expecting ';' after condition.");
    
        // Parse increment
        let increment: Expr | null = null;
        if (this.at().type !== TokenType.CloseParen) {
            increment = this.parse_expr();
        }
        this.expect(TokenType.CloseParen, "Expecting ')' after increment.");
    
        const body = this.parse_block();
    
        return {
            kind: "ForStmt",
            initialization,
            condition,
            increment,
            body,
        } as ForStmt;
    }

    private parse_for_condition(): Expr | null {
        if (this.at().type === TokenType.Identifier) {
            const identifier = this.parse_identifier();
            if (this.at().type === TokenType.LessThan || this.at().type === TokenType.GreaterThan) {
                this.eat(); // consume '<'
                const value = this.parse_expr();
                return {
                    kind: "BinaryExpr",
                    left: identifier,
                    right: value,
                    operator: TokenType.LessThan,
                } as BinaryExpr;
            } else {
                return identifier;
            }
        } else {
            return null;
        }
    }
    

    private parse_stmt(): Stmt {
        if (this.at().type === TokenType.int || this.at().type === TokenType.float || this.at().type === TokenType.bool || this.at().type === TokenType.char || this.at().type === TokenType.String || this.at().type === TokenType.Double) {
          const type =
            this.at().type === TokenType.int ||
            this.at().type === TokenType.float ||
            this.at().type === TokenType.bool ||
            this.at().type === TokenType.char ||
            this.at().type === TokenType.String ||
            this.at().type === TokenType.Double
              ? this.eat().type
              : null;
          const identifier = this.parse_identifier();

            
          if (this.at().value === "=") {
            this.eat();
            const initializer = this.parse_expr();
            if (this.at().type !== TokenType.Semi) {
              console.error("Invalid syntax, missing Semicolon symbol");
              process.exit();
            }
            this.eat();
            return {
              kind: "VariableDeclaration",
              identifier,
              type,
              initializer,
            } as VariableDeclaration;
          } if (this.at().type === TokenType.OpenBracket) {
             this.eat();

             this.expect(TokenType.CloseBracket, "Expecting ']' to end the array declaration.");
             this.eat();
             this.eat();
             let arrayElements = [];
             while(this.at().type !== TokenType.CloseBracket) {
                if(this.at().value == ',') {
                    this.eat();
                }
                const element = this.eat().value;
                arrayElements.push(element);
             }
             this.expect(TokenType.CloseBracket, "Expecting ']' to end the array declaration.");
             return {
               kind: "VectorDeclaration",
               identifier,
               type,
               isArray: true,
               initializer: arrayElements, 
             } as VectorDeclaration;
            } 

          else {
            if (this.at().type !== TokenType.Semi) {
              console.error("Invalid syntax, missing Semicolon symbol");
              process.exit();
            }
            this.eat();
            return {
              kind: "VariableDeclaration",
              identifier,
              type,
              initializer: null,
            } as VariableDeclaration;
          }
        } else if (this.at().type === TokenType.Semi) {
          this.eat();
          return { kind: "Semicolon" };
        } else if (this.at().type === TokenType.Function) {
          return this.parse_function_declaration();
        } else if (this.at().type === TokenType.While) {
          return this.parse_while();
        } else if (this.at().type === TokenType.If) {
          return this.parse_if();
        } else if (this.at().type === TokenType.OpenCurlyBrace) {
          return this.parse_block();
        } else if (this.at().type === TokenType.Switch) {
            return this.parse_switch();
        } else if (this.at().type === TokenType.For) {
            return this.parse_for();
        } else if (this.at().type === TokenType.CommentLine) {
            this.eat();
            return { kind: "Semicolon" };
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

            if (
                operator === TokenType.PlusPlus ||
                operator === TokenType.MinusMinus
            ) {
                right = {
                    kind: "UnaryExpr",
                    operator,
                } as Expr;
            } else {
                right = this.parse_multiplicative_expr();
            }

            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;

            if (this.at().type === TokenType.Semi) {
                this.eat();
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
            this.at().type === TokenType.SlashEquals ||
            this.at().type === TokenType.LessThan
        ) {
            const operator = this.eat().type;
            let right: Expr;
    
            if (
                operator === TokenType.PlusPlus ||
                operator === TokenType.MinusMinus
            ) {
                right = {
                    kind: "UnaryExpr",
                    operator,
                } as Expr;
            } else {
                right = this.parse_multiplicative_expr();
            }
    
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
    
            if (this.at().type === TokenType.Semi) {
                this.eat();
            }
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

            case TokenType.float:
                return {
                    kind: "FloatLiteral",
                    value: parseFloat(this.eat().value)
                } as FloatLiteral
            case TokenType.Double:
                return {
                    kind: "DoubleLiteral",
                    value: parseFloat(this.eat().value)
                } as DoubleLiteral
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
                this.expect(
                    TokenType.CloseParen,
                    "Unexpected token found inside parenthesized expression. Expected closing parenthesis."
                );
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

            case TokenType.char:
                return {kind: "Char", symbol: this.eat().value} as Char;

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
