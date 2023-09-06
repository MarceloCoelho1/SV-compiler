import { Token, TokenType } from "./tokenType";

const LETTER = /[a-zA-Z]/
const WHITESPACE = /\n \t/
const NUMBERS = /[0-9]/


function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t";
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

function reservedKeyword(reserved: string): boolean {
  const keywords = ['sv']

  return keywords.includes(reserved)
}


export default function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  // produce tokens until the EOF is reached.
  while (src.length > 0) {
    // BEGIN PARSING ONE CHARACTER TOKENS
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } // HANDLE BINARY OPERATORS
    else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/") {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } // Handle Conditional & Assignment Tokens
    else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ';') {
      tokens.push(token(src.shift(), TokenType.Semi));
    }
    // HANDLE MULTICHARACTER KEYWORDS, TOKENS, IDENTIFIERS ETC...
    else {
      // Handle numeric literals -> Integers
      if (NUMBERS.test(src[0])) {
        let num = "";
        while (src.length > 0 && NUMBERS.test(src[0])) {
          num += src.shift();
        }

        // append new numeric token.
        tokens.push(token(num, TokenType.Number));
      } else if (src[0] === "'") {
        let ident = "";
        src.shift();
        while (src.length > 0 && src[0] != "'") {
          ident += src.shift();
        }
        src.shift()
        tokens.push(token(ident, TokenType.String))
      }
      // Handle Identifier & Keyword Tokens.
      else if (LETTER.test(src[0])) {
        let ident = "";
        while (src.length > 0 && LETTER.test(src[0])) {
          ident += src.shift();
        }
  
        // CHECK FOR RESERVED KEYWORDS
        const reserved = reservedKeyword(ident);
        // If value is not undefined then the identifier is
        // reconized keyword
        if (ident == 'return') {
          tokens.push(token(ident, TokenType._return));
        } else if (reserved && ident === 'sv') {
          tokens.push(token(ident, TokenType.Sv))
        } 
        else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isskippable((src[0]))) {
        // Skip uneeded chars.
        src.shift();
      } // Handle unreconized characters.
      // TODO: Impliment better errors and error recovery.
      else {

        console.error(
          "Unreconized character found in source: ",
          src[0].charCodeAt(0),
          src[0],
        );
        process.exit();
      }
    }
  }

  tokens.push({ value: "EndOfFile", type: TokenType.EOF });
  return tokens;
}