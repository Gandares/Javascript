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

const limite = program.collect.length;

function readwrite(index){
    return new Promise(function(resolve,reject){
        fs.readFile(program.collect[index], (err, data) => {
            if (err) {
                reject(err);
            }
            fs.appendFile(salida, data.toString(), (err) => {
                if (err) {
                   reject(err);
                }
            });
            resolve('ok');
        })
    })
        .catch( err => console.error(err));
}

console.log(1)

var vficheros = new Array(limite);

console.log(1)

Promise.all(vficheros.map(element => readwrite(element.indexOf(element))))
    .then( () => {
        const cat = spawn('cat', [salida]);
        cat.stdout.pipe(process.stdout);
    })
    .catch(err => console.log(err));

//NOPE