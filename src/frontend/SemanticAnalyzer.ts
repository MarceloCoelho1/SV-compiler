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

export default class SemanticAnalyzer {
    private symbolTable: Map<string, TokenType> = new Map();

    constructor(private ast: Program) { }


    analyze(): void {
        for (const statement of this.ast.body) {
            if (statement.kind === "VariableDeclaration") {
                this.analyzeVariableDeclaration(statement as VariableDeclaration);
            } else if (statement.kind === "BinaryExpr") {
                this.analyzeBinaryExpression(statement as BinaryExpr);
            } else if (statement.kind === "_return") {
                this.analyzeReturnStatement(statement as _return);
            } // Adicione mais casos conforme necessário para outros tipos de nó.
        }

        // Verifique se o último nó é uma operação binária e a resolva
        if (this.ast.body.length > 0) {
            const lastStatement = this.ast.body[0];
            if (lastStatement.kind === "BinaryExpr") {
                this.analyzeBinaryExpression(lastStatement as BinaryExpr);
            }
        }
    }



    private analyzeVariableDeclaration(declaration: VariableDeclaration): void {
        const identifier = declaration.identifier.symbol;
        const initializer = declaration.initializer;
        

        if (this.symbolTable.has(identifier)) {
            console.error(`Variable '${identifier}' is already declared.`);
            process.exit(1);
        }

        if (!initializer) {
            console.error(`Variable '${identifier}' must be initialized.`);
            process.exit(1);
        }

        if(initializer.kind === 'BinaryExpr') {
            this.analyzeBinaryExpression(initializer as BinaryExpr)
        }

        this.symbolTable.set(identifier, TokenType.Identifier);
    }

    private analyzeBinaryExpression(expr: BinaryExpr): NumericLiteral {
        if (expr.left.kind === 'BinaryExpr') {
            
            expr.left = this.analyzeBinaryExpression(expr.left as BinaryExpr);
        }

        if (expr.right.kind === 'BinaryExpr') {
            
            expr.right = this.analyzeBinaryExpression(expr.right as BinaryExpr);
        }

        if (expr.operator === '+') {
            // Verifica se a operação de adição está sendo aplicada a números
            if (expr.left.kind !== 'NumericLiteral' || expr.right.kind !== 'NumericLiteral') {
                console.error('Operação de adição inválida: os dois lados da expressão devem ser números.');
                process.exit();
            } else {
                let result: NumericLiteral = this.resolveBinaryExpr(expr.left, expr.right, expr.operator);
                return result;
            }
        } else if (expr.operator === '*') {
            // Verifica se a operação de multiplicação está sendo aplicada a números
            if (expr.left.kind !== 'NumericLiteral' || expr.right.kind !== 'NumericLiteral') {
                console.error('Operação de multiplicação inválida: os dois lados da expressão devem ser números.');
                process.exit();
            } else {
                let result: NumericLiteral = this.resolveBinaryExpr(expr.left, expr.right, expr.operator);
                return result;
            }
        } else if(expr.operator === '-') {
            if (expr.left.kind !== 'NumericLiteral' || expr.right.kind !== 'NumericLiteral') {
                console.error('Operação de Subtração inválida: os dois lados da expressão devem ser números.');
                process.exit();
            } else {
                let result: NumericLiteral = this.resolveBinaryExpr(expr.left, expr.right, expr.operator);
                return result;
            }
            
        } else if(expr.operator === '/') {
            if (expr.left.kind !== 'NumericLiteral' || expr.right.kind !== 'NumericLiteral') {
                console.error('Operação de Divisão inválida: os dois lados da expressão devem ser números.');
                process.exit();
            } else {
                let result: NumericLiteral = this.resolveBinaryExpr(expr.left, expr.right, expr.operator);
                return result;
            }
        } else {
            return {} as NumericLiteral;
        }
        // Adicione mais verificações para outros operadores, se necessário
    }


    private resolveBinaryExpr(left: any, right: any, operator: string): NumericLiteral {
        if (operator === '*') {
            return {
                kind: 'NumericLiteral',
                value: left.value * right.value
            } as NumericLiteral;
        } else if (operator === '+') {
            return {
                kind: 'NumericLiteral',
                value: left.value + right.value
            } as NumericLiteral;
        } else if(operator === '-') {
            return {
                kind: "NumericLiteral",
                value: left.value - right.value
            } as NumericLiteral;
        } else if(operator === '/') {
            return {
                kind: "NumericLiteral",
                value: left.value / right.value
            } as NumericLiteral;
        } else {
            return {} as NumericLiteral;
        }
    }


    private getType(expr: Expr): TokenType {
        if (expr.kind === "NumericLiteral") {
            return TokenType.Number;
        } else if (expr.kind === "Identifier") {
            const identifier = expr as Identifier;
            const identifierType = this.symbolTable.get(identifier.symbol);
            if (!identifierType) {
                console.error(`Variable '${identifier.symbol}' is not declared.`);
                process.exit(1);
            }
            return identifierType;
        }
        // Implemente mais casos para outros tipos de expressões, se necessário.
        return TokenType.Identifier; // Tipo padrão para expressões desconhecidas.
    }



    private analyzeReturnStatement(statement: _return): void {
        // Verifique se a declaração de retorno está dentro de uma função (adicione essa lógica conforme necessário).

        if (statement.expression) {
            const returnType = this.getType(statement.expression);

            // Implemente verificações para garantir que o tipo de retorno seja consistente com o tipo da função.
            // Verifique também se o tipo da função é consistente com o contexto em que a declaração de retorno está.

            // Exemplo simplificado:
            if (returnType !== TokenType.Number) {
                console.error(`Invalid return type.`);
                process.exit(1);
            }
        }
    }

}
