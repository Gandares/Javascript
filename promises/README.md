# Estudio de las promesas

Para empezar hablando de las promesas, primero tenemos que repasar los "callbacks".
Como ya sabemos, javascript es un lenguaje asíncrono, lo cual es una ventaja, pero en algunos casos, una desventaja. Tenemos el siguiente ejemplo:

```javascript
function loadScript(src) {
  let script = document.createElement('script');
  script.src = src;
  document.head.append(script);
}
```
El cual es una función que crea un "tag" -> <script src="..."> y lo añade al head. Si intentamos cargar el script y acto seguido llamar a una función del propio script de la siguiente manera:
  
```javascript
loadScript('/my/script.js'); // script que contiene "function newFunction() {…}"

newFunction();
```
Se da el caso de que no se encuentra la función, esto se debe a que cuando es llamada la función "newFunction()", todavía no se ha cargado el script que la contiene.

Esto puede ser resuelto añadiendo una "callback" a la función que carga el script y dicha "callback" llame a la "newFunction()":

```javascript
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;

  script.onload = () => callback(script);

  document.head.append(script);
}
```

```javascript
loadScript('/my/script.js', function() {
  newFunction();
});
```

De esta manera con "callbacks" solucionamos el problema.

<h2>Llamando callback en callback</h2>

Siguiendo el ejemplo anterior, ¿Si ahora queremos cargar un script más después del primero? Se le pasa como callback dentro de la callback del primero:

```javascript
loadScript('/my/script.js', function(script) {
  alert(`Cool, the ${script.src} is loaded, let's load one more`);
  loadScript('/my/script2.js', function(script) {
    alert(`Cool, the second script is loaded`);
  });
});
```

De esta manera nos aseguramos de que el segundo se ejecuta después del primero, ¿Que pasaría si queremos un tercero?

```javascript
loadScript('/my/script.js', function(script) {
  // Algo
  loadScript('/my/script2.js', function(script) {
    // Algo
    loadScript('/my/script3.js', function(script) {
      // Algo
    });
  });
});
```

Y asi sucesivamente si queremos cargar mas scripts uno detras de otro.

<h2>Manejo de errores</h2>

En el ejemplo anterio no tuvimos en cuenta que pudiera ocurrir algún error. Deberiamos dotar a nuestro programa de un manejo de errores.

```javascript
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`Script load error for ${src}`)); // Si ocurre algún error

  document.head.append(script);
}
```

 - Si carga el script, pasamos como parámetro de error un null y el objeto script.
 - Si existe algún error, pasamos un objeto Error.

```javascript
loadScript('/my/script.js', function(error, script) {
  if (error) {
    // manejo de error
  } else {
    // El script se cargó correctamente
  }
});
```

Con un "if else", si error no es nulo, manejamos nuestro error, lo imprimimos por pantalla y paramos el programa, etc. si es nulo, continuamos como queremos.

Esto es llamado "[error-first callback](https://nodejs.org/api/errors.html#errors_error_first_callbacks)", un convenio en javascript.

<h2>"Piramid of Doom"</h2>

Utilizar "callbacks" repetidas veces, a primera vista, parece una manera viable de resolver la asincronía, pero cuando tenemos anidados muchos callbacks, el programa puede ser difícil de manejar:

```javascript
loadScript('1.js', function(error, script) {

  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript('2.js', function(error, script) {
      if (error) {
        handleError(error);
      } else {
        // ...
        loadScript('3.js', function(error, script) {
          if (error) {
            handleError(error);
          } else {
            // ...continue after all scripts are loaded (*)
          }
        });

      }
    })
  }
});
```

Esto es llamado "Callback hell" o "Piramid of Doom" por el hecho por cada acción asíncrona identa hacia la derecha. Esto pronto se sale de control. No es una buena técnica de programación cuando se tienen muchos "callbacks" anidados.

Existen técnicas para evirtar esto, pero una de las mejores son las promesas.


<h1>Promesas</h1>

La promesa es un objeto que representa la terminación o el fracaso eventual de una operación asíncrona. Es creada de la siguiente manera:

```javascript
let promise = new Promise(function(resolve, reject) {
  // Algo
});
```

La función pasada a "Promise" es llamada el ejecutor y esta recibe dos parámetros que son "callbacks" a su vez. Resolve correrá cuando el programa acabe de forma satisfactoria -> resolve(value), y reject si acaba con un error o excepción -> reject(error).

Lo que se declara dentro de la promesa debe ser un código asíncrono el cual se quiera testear, si llegamos a un punto en el que ya sepamos que acabó de manera satisfactoria, le indicamos que llame a resolve y en caso contrario a reject.

![Html](https://javascript.info/article/promise-basics/promise-resolve-reject.svg)

Un ejemplo es el siguiente:

```javascript
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("done"), 1000);
});
```
La función se ejecuta automaticamente cuando la promesa es construida. Después de 1 segundo se indicará que acabó correctamente con resolve pasando como parámetro "done".

Ahora un ejemplo parecido, pero acabando con un error:

```javascript
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});
```

De esta manera, después de 1 segundo indicará que hubo un error con reject pasando como argumento "Whoops!".

Cuidado a la hora de colocar en la promesa los reject y los resolve, porque una vez se llegue a uno de ellos, el resto de la promesa será ignorada dado que solo puede haber un resultado posible:


```javascript
let promise = new Promise(function(resolve, reject) {
  resolve("done");

  reject(new Error("…")); // Se ignora
  setTimeout(() => resolve("…")); // Se ignora
});
```

Es recomendado que el reject devuelva un objeto Error para el manejo de errores.

<h2>then, catch, finally</h2>

Como se dijo anteriormente, resolve y reject son "callback" lo que quiere decir que cuando son llamados, depende de uno u otro harán distintas cosas(depende de como queramos).

Las funciones son .then() para el resolve, .catch() para el reject y .finally(), que esta se ejecuta tanto si es un resolve o un reject.

La sintaxis del .then():

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});

promise.then(
  function(result) { /* Manejo de una ejecución satisfactoria */ },
  function(error) { /* Manejo de errores */ }
);
```
En este ejemplo también se usa el .then() para el manejo de errores, aunque para eso existe el .catch().

La sintaxis del .catch():

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});

// .catch(f) es lo mismo que promise.then(null, f)
promise.catch(alert); // Muestra "Error: Whoops!" después de 1 segundo
```

La sintaxis del .finally():

```javascript
new Promise((resolve, reject) => {
  // Hacer algo y llamar a reject o resolve
})
  // Se ejecuta da igual si es reject o resolve
  .finally(() => stop loading indicator)
  .then(result => show result, err => show error)
```

.finally(f) es equivalente a .then(f,f) y es un buen controlador para realizar limpieza a variables y no lleva argumentos.

Ahora realizando el ejemplo del loadScript() con promesas sería de la siguiente manera:

```javascript
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    let script = document.createElement('script');
    script.src = src;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));

    document.head.append(script);
  });
}
```

```javascript
let promise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.js");

promise
      .then( script => alert(`${script.src} is loaded!`)
      .catch( error => alert(`Error: ${error.message}`);
```

<h1>Encadenando promesas</h1>

Volviendo al apartado de las "callbacks" donde tenemos una secuencia de operaciones asíncronas que deben ser colocadas una detrás de otras, las promesas proporcionan unas cuantas recetas para resolverlo.

```javascript
new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000); // (*)

}).then(function(result) { // (**)

  alert(result); // 1
  return result * 2;

}).then(function(result) { // (***)

  alert(result); // 2
  return result * 2;

}).then(function(result) {

  alert(result); // 4
  return result * 2;

});
```

La idea es ir pasando el valor de .then() en .then().
El flujo es el siguiente, la promesa inicial llama a resolve con 1, la función .then() es llamada y esta devuelve otro valor el cual es pasado al siguiente .then(), y así sucesivamente.

Funciona, porque la llamada a promise.then devuelve una promesa asi que de esa manera se llama al siguiente .then.

Ojo con esto, porque un error de novato es el siguiente:

```javascript
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(1), 1000);
});

promise.then(function(result) {
  alert(result); // 1
  return result * 2;
});

promise.then(function(result) {
  alert(result); // 1
  return result * 2;
});

promise.then(function(result) {
  alert(result); // 1
  return result * 2;
});
```

Aquí no se están encadenando promesas, todos los .then son llamados por la misma promesa, así que todos mostrarán en este caso el mismo resultado. Aunque devuelvan todas un valor, no se llaman entre si.

<h2>Retornando promesas</h2>

Un controlador, utilizado en .then(controlador) puede crear y devolver una promesa.
En ese caso, otros manejadores esperan hasta que se estabilice y luego obtienen su resultado.

Por ejemplo:

```javascript
new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000);

}).then(function(result) {

  alert(result); // 1

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) {

  alert(result); // 2

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) {

  alert(result); // 4

});
```

El primer .then muestra el 1 y devuelve una promesa, la cual, despues de 1 segundo se resuelve con el resultado anterior multiplicado por 2, esta cuando se resuelva hará lo mismo que la anterior pero con el nuevo resultado, etc.

Devolviendo promesas se nos permite construir cadenas de acciones asíncronas.

<h2>Usando el ejemplo de loadScript</h2>

```javascript
loadScript("/article/promise-chaining/one.js")
.then(function(script) {
  return loadScript("/article/promise-chaining/two.js");
})
.then(function(script) {
  return loadScript("/article/promise-chaining/three.js");
})
.then(function(script) {
  // use functions declared in scripts
  // to show that they indeed loaded
  one();
  two();
  three();
});
```
  
El código se puede acortar utilizando funciones flecha:
  
```javascript
loadScript("/article/promise-chaining/one.js")
.then(script => loadScript("/article/promise-chaining/two.js"))
.then(script => loadScript("/article/promise-chaining/three.js"))
.then(script => {
  // scripts are loaded, we can use functions declared there
  one();
  two();
  three();
});
```

De esta manera, al llamar a loadScript, cargará el primer script y al hacerlo, llama a .then y acto seguido a loadScript otra vez con otro script, al cargar este y resolverse, llama al siguiente .then y asi sucesivamente.

técnicamente se puede añadir .then directamente a cada loadScript de la siguiente manera:

```javascript
loadScript("/article/promise-chaining/one.js").then(script1 => {
  loadScript("/article/promise-chaining/two.js").then(script2 => {
    loadScript("/article/promise-chaining/three.js").then(script3 => {
      // this function has access to variables script1, script2 and script3
      one();
      two();
      three();
    });
  });
});
```

Aunque de esta manera, el programa crece hacia la derecha y ocurre lo mismo que con las "callbacks". Los tres programas hacen lo mismo.

Para ser precisos, un controlador, .then, .catch, .finally, pueden no devolver una promesa exactamente, sino los llamados “thenable”, objetos que tienen un método .then y son tratados igual que una promesa.

```javascript
class Thenable {
  constructor(num) {
    this.num = num;
  }
  then(resolve, reject) {
    alert(resolve); // function() { código }
    setTimeout(() => resolve(this.num * 2), 1000); // (**)
  }
}

new Promise(resolve => resolve(1))
  .then(result => {
    return new Thenable(result); // (*)
  })
  .then(alert); // mostrar "2" despues de 1 segundo
```

Javascript observa el objeto devuelto en .then de la promesa, si este último tiene un método llamado then, se ejecutará de manera similar al ejecutor.

<h2>Ejemplo con fetch</h2>

En el "frontend", las promesas son utilizadas generalmente para solicitudes de red

```javascript
let promise = fetch(url);
```

fetch() proporciona una forma fácil y lógica de obtener recursos de forma asíncrona por la red y retorna una promesa.
