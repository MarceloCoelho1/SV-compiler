# Simple SV to Java Compiler

I created my first compiler written in TypeScript that compiles a language I designed, called SV (Simple Language), into Java. The primary goal of this project was to learn about compiler development and understand the various stages involved in the compilation process.

## Introduction

This project represents a simple yet educational exercise in building a compiler from scratch. The SV language is intentionally minimalistic, and the compiler is limited in its capabilities, designed primarily for educational purposes.

## Key Features

- **Language Design**: SV is a minimalistic language created specifically for this project. It supports basic variable declarations, numeric expressions, and string literals.

- **Type Checking**: The compiler performs basic type checking to ensure that operations are performed on compatible data types. It checks for errors like trying to add a string to a number.

- **Code Generation**: The compiler generates Java code based on the SV source code. It translates SV constructs into Java, aiming to maintain the intended logic.

## Usage

1. Clone the repository to your local machine.
2. Ensure you have Node.js and TypeScript installed.
3. Write or use an existing SV source file (with a `.sv` extension).
4. Run the compiler using the following command:
   ```bash
   node src/main.ts input.sv output.java
   ```

5. Code example: sv num = 10; || sv name = 'Hello World!'; || sv expression = 10 + 10 * 3 / 2 + 4;

output example: ```java
                public class Main {
    public static void main(String[] args) {
        int num = 10;
    }
}
                ```

## Limitations
1. Limited Language Support: The SV language supports only basic features and is not suitable for practical use. It was designed solely for educational purposes.
2. No Optimizations: The compiler does not perform any optimizations. The generated code may not be efficient or idiomatic Java.
3. Partial Compilation: The compiler only handles a subset of SV language features. It's not a full-fledged compiler for a real programming language.

## Acknowledgments

This project was created as a learning exercise, and it's not intended for production use. If you are interested in diving deeper into compiler development, it can serve as a starting point for exploring more advanced concepts.

Feel free to experiment with it, enhance it, or use it as a foundation for further compiler-related exploration.