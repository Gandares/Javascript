var resrej = 1;

var promise = new Promise(function(resolve,reject){
    if(resrej==1)
        reject("error");
    else
        resolve("correcto");
});

promise
    .then( result => console.log(result))
    .catch( error => console.error(error));

promise
    .then(
        function(result){ console.log(result) },
        function(error){ console.error(error) },
    );