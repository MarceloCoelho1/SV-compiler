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
    Comma,
    If,
    While,
    Else,
    EqualsEquals,
    NotEquals,
    PlusEquals,
    MinusEquals,
    StarEquals,
    SlashEquals,
    PlusPlus,
    MinusMinus,
    Plus,
    Minus,
    Star,
    Slash,
    Percent
}

export type Token = {
    value: string,
    type: TokenType
}