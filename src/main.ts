import * as fs from 'node:fs';
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process';
import tokenize from './frontend/tokenizer';
import Parser from './frontend/parser'
import SemanticAnalyzer from './frontend/SemanticAnalyzer'
import CodeGenerator from './backend/generateCode';

// -> /home/marcelo/Desktop/side-projects/compiler/src/test.sv


function readFile(pathOfFile: string):string {
    if (!pathOfFile.endsWith('.sv')) {
        console.error('Incorrect file extension')
        process.exit()
    }

    try {
        const fileContent = fs.readFileSync(pathOfFile, { encoding: 'utf8', flag: 'r' });
        return fileContent;
    } catch (error) {
        console.error(error)
        process.exit()
    }

    
}



async function main() {
    const parser = new Parser()
    const rl = readline.createInterface({ input, output });

    const pathOfFIle = await rl.question('What is the full file path?: ');

    const fileContent = readFile(pathOfFIle)
    const tokens = tokenize(fileContent)
    const program = parser.produceAST(tokens)
    const programSemantic = new SemanticAnalyzer(program)
    programSemantic.analyze()
    const generator = new CodeGenerator()
    let objectCode = generator.generateJavaCode(program)
    
    try {
        fs.writeFileSync('./Main.java', objectCode)
        console.log('Code generate with success!')
    } catch (error) {
        console.error(error)
    }
    
    

    rl.close();

}

main()
