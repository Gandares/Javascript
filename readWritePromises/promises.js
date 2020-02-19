'use strict'
const program = require('commander');
const fs = require('fs');
const spawn = require('child_process').spawn;

function collect(value, previous) {
  return previous.concat([value]);
}

program
    .option('-f, --collect <value>', 'repeatable collect file', collect, [])
    .option('-o, --salida <value>', 'output file', 'out.txt')

program.parse(process.argv);

const salida = program.salida;

program.collect.forEach(element => {
    if(!fs.statSync(element).isFile()){
        throw Error('A file must be specified!');
    }
});

var actual = 0;
const limite = program.collect.length;

var readWrite = () => {
    return new Promise(function(resolve,reject){
        fs.readFile(program.collect[actual], (err, data) => {
            if (err) {
                reject(err);
            }
            fs.appendFile(salida, data.toString(), (err) => {
                if (err) {
                reject(err);
                }
                actual++;
                if(actual<limite){
                    readWrite();
                }
                else{
                    resolve();
                }
            });
        });
    })
    .then(() => {
        const cat = spawn('cat', [salida]);
        cat.stdout.pipe(process.stdout);
    })
    .catch((err) => console.error(err));
};

readWrite();