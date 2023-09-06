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
    String
}

export type Token = {
    value: string,
    type: TokenType
}