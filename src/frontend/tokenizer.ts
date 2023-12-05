import { Token, TokenType } from "./tokenType";

const LETTER = /[a-zA-Z]/
const WHITESPACE = /[\n\t ]/
const NUMBERS = /[0-9]/
const PUNCTUATION = /\p{P}/u;
const TYPES = ['bool', 'int', 'char', 'double', 'String', 'float'];

function token(value = "", type: TokenType): Token {
  return { value, type };
}


function reservedKeyword(reserved: string): boolean {
  const keywords = ['sv', 'if', 'else', 'while', 'function', 'return'];

  return keywords.includes(reserved);
}

export default function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  let src = sourceCode.split("");

  while (src.length > 0) {
    if (src[0] === "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] === ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (src[0] === "{") {
      tokens.push(token(src.shift(), TokenType.OpenCurlyBrace));
    } else if (src[0] === "}") {
      tokens.push(token(src.shift(), TokenType.CloseCurlyBrace));
    } else if (src[0] === "=" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.EqualsEquals));
    } else if (src[0] === "!" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.NotEquals));
    } else if (src[0] === "+" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.PlusEquals));
    } else if (src[0] === "-" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.MinusEquals));
    } else if (src[0] === "*" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.StarEquals));
    } else if (src[0] === "/" && src[1] === "=") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.SlashEquals));
    } else if (src[0] === "+" && src[1] === "+") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.PlusPlus));
    } else if (src[0] === "-" && src[1] === "-") {
      tokens.push(token(src.shift() + (src.shift() || ''), TokenType.MinusMinus));
    } else if (src[0] === "+") {
      tokens.push(token(src.shift(), TokenType.Plus));
    } else if (src[0] === "-") {
      tokens.push(token(src.shift(), TokenType.Minus));
    } else if (src[0] === "*") {
      tokens.push(token(src.shift(), TokenType.Star));
    } else if (src[0] === "%") {
      tokens.push(token(src.shift(), TokenType.Percent));
    } else if (src[0] === "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] === ';') {
      tokens.push(token(src.shift(), TokenType.Semi));
    } else if (src[0] === ',') {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else if (src[0] == ':') {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] === "<") {
      tokens.push(token(src.shift(), TokenType.LessThan));
    } else if(src[0] === '>') {
     tokens.push(token(src.shift(), TokenType.GreaterThan)); 
    } else {
      if (NUMBERS.test(src[0])) {
        let num = "";

        // Parte inteira
        while (src.length > 0 && NUMBERS.test(src[0])) {
          num += src.shift();
        }

        
        // Parte decimal (se houver)
        if (src[0] === '.') {
          num += src.shift();
          while (src.length > 0 && NUMBERS.test(src[0])) {
            num += src.shift();
          }
         
          if (num.length < 32) {
            tokens.push(token(num, TokenType.float));
          } else {
            tokens.push(token(num, TokenType.Double))
          }
        } else {
          tokens.push(token(num, TokenType.Number));
        }
      } else if (src[0] === '/' && src[1] === '/') {
          src.shift();
          src.shift();
          let comment = "";
          while (src.length > 0 && !src[0].match(/[\n\r]/)) {
            comment += src.shift();
          }
          tokens.push(token(comment, TokenType.CommentLine));
        }else if (src.join('').startsWith('function')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('function', TokenType.Function));
      } else if (src.join('').startsWith('for')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('for', TokenType.For));
      } else if (src.join('').startsWith('if')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('if', TokenType.If));
      } else if (src.join('').startsWith('else')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('else', TokenType.Else));
      } else if (src.join('').startsWith('while')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('while', TokenType.While));
      } else if (src.join('').startsWith('switch')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('switch', TokenType.Switch));
      } else if (src.join('').startsWith('case')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('case', TokenType.Case));
      } else if (src.join('').startsWith('break')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('break', TokenType.Break));
      } else if (src.join('').startsWith('default')) {
        while (src.length > 0 && LETTER.test(src[0])) {
          src.shift();
        }
        tokens.push(token('default', TokenType.Default));
      } else if (src[0] === "'") {
        const quote = src.shift();
        const charValue = src.shift(); 

        if (src[0] !== quote) {
          console.error("not a char: ", charValue);
          process.exit();
        }

        tokens.push(token(charValue, TokenType.char));

        src.shift(); 
      } else if (src[0] === '"') {
        const quote = src.shift();
        let ident = "";
        while (src.length > 0 && src[0] !== quote) {
          ident += src.shift();
        }
        if (src[0] === quote) {
          src.shift(); 
          tokens.push(token(ident, TokenType.String));
        } else {
          console.error("Unterminated string literal.");
          process.exit();
        }
      } else if (LETTER.test(src[0])) {
        let ident = "";
        while (src.length > 0 && LETTER.test(src[0])) {
          ident += src.shift();
        }

        if (TYPES.includes(ident)) {
          if (ident == 'String') {
            tokens.push(token(ident, TokenType.String));
          } else if (ident == 'int') {
            tokens.push(token(ident, TokenType.int));
          } else if (ident == 'float') {
            tokens.push(token(ident, TokenType.float));
          } else if (ident == 'char') {
            tokens.push(token(ident, TokenType.char));
          } else if (ident == 'bool') {
            tokens.push(token(ident, TokenType.bool));
          } else if (ident == 'double') {
            tokens.push(token(ident, TokenType.Double));
          } else if (src[0] === "/") {
              tokens.push(token(src.shift(), TokenType.Slash));
          }
        } else {
          const reserved = reservedKeyword(ident);
          if (ident === 'return') {
            tokens.push(token(ident, TokenType._return));
          } else if (reserved && ident === 'sv') {
            tokens.push(token(ident, TokenType.Sv));
          } else {
            tokens.push(token(ident, TokenType.Identifier));
          }
        }

      } else if (WHITESPACE.test(src[0])) {
        src.shift();
      } else {
        console.error("Unrecognized character found in source: ", src[0]);
        process.exit();
      }
    }
  }

  tokens.push({ value: "EndOfFile", type: TokenType.EOF });
  return tokens;
}
