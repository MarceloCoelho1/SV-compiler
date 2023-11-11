export enum TokenType  {
    Semi,
    _return,
    EOF,
    OpenParen,
    CloseParen,
    BinaryOperator,
    Equals,
    Identifier,
    Number,
    Sv,
    String,
    OpenCurlyBrace,
    CloseCurlyBrace,
    Function,
    Comma
}

export type Token = {
    value: string,
    type: TokenType
}