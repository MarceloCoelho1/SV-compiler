import { Program, VariableDeclaration, BinaryExpr, NumericLiteral, Identifier, String as StringType } from "../frontend/ast";

export default class CodeGenerator {
  registerCounter: number;

  constructor() {
    this.registerCounter = 0;
  }

  generateJavaCode(program: Program): string {
    let javaCode = "public class Main {\n";
    javaCode += "    public static void main(String[] args) {\n";

    for (const statement of program.body) {
      if (statement.kind === "VariableDeclaration") {
        javaCode += this.generateVariableDeclaration(statement as VariableDeclaration);
      }
    }

    javaCode += "    }\n";
    javaCode += "}\n";

    return javaCode;
  }

  generateVariableDeclaration(declaration: VariableDeclaration): string {
    const identifier = declaration.identifier.symbol;
    let initializerCode = "";
  
    if (declaration.initializer) {
      if (declaration.initializer.kind === "NumericLiteral") {
        const initializer = this.generateExpression(declaration.initializer as NumericLiteral);
        initializerCode = ` = ${initializer}`;
      } else if (declaration.initializer.kind === "String") {
        const initializer = this.generateExpression(declaration.initializer as StringType);
        initializerCode = ` = ${initializer}`;
        // Adicione o tipo String ao identificador
        return `        String ${identifier}${initializerCode};\n`;
      } else if (declaration.initializer.kind === "BinaryExpr") {
        const binaryExpr = declaration.initializer as BinaryExpr;
        const left = this.generateExpression(binaryExpr.left);
        const right = this.generateExpression(binaryExpr.right);
        const operator = binaryExpr.operator;
        initializerCode = ` = ${left} ${operator} ${right}`;
      } else {
        // Handle other types or report an error for unsupported types
        console.error("Unsupported initializer type:", declaration.initializer.kind);
        return "";
      }
    }
  
    return `        int ${identifier}${initializerCode};\n`;
  }
  
  

  generateExpression(expr: any): string {
    if (expr.kind === "NumericLiteral") {
      return expr.value.toString();
    } else if (expr.kind === "Identifier") {
      return expr.symbol;
    } else if (expr.kind === "BinaryExpr") {
      const left = this.generateExpression(expr.left);
      const right = this.generateExpression(expr.right);

      return `${left} ${expr.operator} ${right}`;
    } else if (expr.kind === "String") {
      return `"${expr.symbol}"`; // Wrap strings in double quotes
    }

    return "";
  }
}
