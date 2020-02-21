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

fetch() proporciona una forma fácil y lógica de obtener recursos de forma asíncrona por la red y retorna una promesa la cual resuelve con el valor "response". Para leer la respuesta se debe usar response.text() el cual devuelve una promesa la cual resuelve cuando el texto es descargado del servidor remoto.

El siguiente código nos permite ver el contenido de por ejemplo un archivo .json:

```javascript
fetch('/ruta/hacia/archivo/algo.json')
  // .then ejecutará cuando el servidor remoto responda
  .then(function(response) {
    // response.text() retorna una new promise que resuelve con el texto completo de response cuando cargue
    return response.text();
  })
  .then(function(text) {
    // ...y se visualiza el contenido del archivo
    alert(text);
  });
```

El objeto response del fetch, tiene un método response.json() el cual analiza el archivo como un .json, en nuestro caso como lo hacemos con un archivo .json es más conveniente.

```javascript
// Igual que antes pero con response.json()
fetch('/ruta/hacia/archivo/algo.json')
  .then(response => response.json())
  .then(algo => alert(algo.name)); // Por ejemplo si el json contiene un campo name
```

Ahora hagamos un fetch a un archivo .json que contenga mi nombre de usuario de github y mostremos la foto de perfil.

```javascript
// hace una petición para user.json
fetch('/ruta/hacia/archivo/algo.json')
  // Lo carga como un json
  .then(response => response.json())
  // Hace una solicitud a su github
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  // Carga "response" como un json
  .then(response => response.json())
  // Muestra el icono del perfil (githubUser.avatar_url) por 3 segundos
  .then(githubUser => {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => img.remove(), 3000); // (*)
  });
```

¿Como podemos mostrar algo después de que la imagen desaparezca? Para hacerlo, debemos retornar otra promesa cuando la imagen se borre.

```javascript
fetch('/ruta/hacia/archivo/algo.json')
  .then(response => response.json())
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  .then(response => response.json())
  .then(githubUser => new Promise(function(resolve, reject) { // (*)
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser); // (**)
    }, 3000);
  }))
  // Se activa después de 3 segundos
  .then(githubUser => alert(`Finished showing ${githubUser.name}`))
```

Y ahora podemos por ejemplo dividir el código para hacer funciones reutilizables:

```javascript
function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}

function loadGithubUser(name) {
  return fetch(`https://api.github.com/users/${name}`)
    .then(response => response.json());
}

function showAvatar(githubUser) {
  return new Promise(function(resolve, reject) {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser);
    }, 3000);
  });
}

// Use them:
loadJson('/ruta/hacia/archivo/algo.json')
  .then(user => loadGithubUser(user.name))
  .then(showAvatar)
  .then(githubUser => alert(`Finished showing ${githubUser.name}`));
```

En resumen, si un manejador retorna una promesa, el resto de la cadena espera hasta que se resuelva y el resultado o error se pasa.

<h1>Manejando errores con promesas</h1>

Las cadenas de promesas son buenos a la hora del manejo de errores, principalmente porque el .catch no tiene porque ir immediatamente, puede ir despues de varios .then.

```javascript
fetch('/ruta/hacia/archivo/algo.json')
  .then(response => response.json())
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  .then(response => response.json())
  .then(githubUser => new Promise((resolve, reject) => {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser);
    }, 3000);
  }))
  .catch(error => alert(error.message));
```

Normalmente ese .catch no se activaría pero si alguna de las promesas de arriba realiza un reject, entonces sí.

<h2>try...catch implícito</h2>

El código de un ejecutor y de los manejadores de las promesas tiene un try...catch "invisible" y si ocurre una excepción queda atrapada y lo trata como un rechazo.

```javascript
new Promise((resolve, reject) => {
  throw new Error("Whoops!");
}).catch(alert); // Error: Whoops!
```

Ese código trabaja de la misma manera que este:

```javascript
new Promise((resolve, reject) => {
  reject(new Error("Whoops!"));
}).catch(alert); // Error: Whoops!
```

El ejecutor detecta el error automáticamente y lo transforma en un "reject" y esto también ocurre con los manejadores. Si realizamos un "throw" dentro de un .then, lo toma como un rechazo.

```javascript
new Promise((resolve, reject) => {
  resolve("ok");
}).then((result) => {
  throw new Error("Whoops!"); // rejects the promise
}).catch(alert); // Error: Whoops!
```

Además, no solo tiene que ser un throw, también puede ser por un error de programación:

```javascript
new Promise((resolve, reject) => {
  resolve("ok");
}).then((result) => {
  blabla(); // No existe la función
}).catch(alert); // ReferenceError: blabla is not defined
```

El último .catch no solo caza errores explícitos, también errores accidentales.

<h2>Rethrowing</h2>

En un try...catch podemos analizar los errores y quizás "rethrow" si no pueden ser manejados. Con las promesas se puede hacer lo mismo. Si lanzamos un "throw" dentro de un .catch, el error será lanzado al siguiente manejador de errores más cercano. Y si lo logramos manejar, podemos mandarlo al siguiente .then.

```javascript
// Ejecución: catch -> then
new Promise((resolve, reject) => {

  throw new Error("Whoops!");

}).catch(function(error) {

  alert("The error is handled, continue normally");

}).then(() => alert("Next successful handler runs"));
```

En este caso, el error es manejado y el programa continua de manera normal.

En el siguiente ejemplo se da el caso en el que se caza un error y no es posible manejarlo, asi que se lanza al siguiente .catch:

```javascript
// ejecución: catch -> catch
new Promise((resolve, reject) => {

  throw new Error("Whoops!");

}).catch(function(error) { // (*)

  if (error instanceof URIError) {
    // Manejarlo
  } else {
    alert("Can't handle such error");

    throw error; // Lanzar al siguiente .catch
  }

}).then(function() {
  /* No se ejecuta */
}).catch(error => { // (**)

  alert(`The unknown error has occurred: ${error}`);

});
```

<h2>Rechazos sin manejar</h2>

¿Que ocurre cuando un error no es manejado?

```javascript
new Promise(function() {
  noSuchFunction(); // Error, no existe la función
})
  .then(() => {
    // Resolve
  }); // No existe .catch al final
```

En caso de error, la promesa se rechaza y la ejecución debe saltar al controlador de rechazo más cercano. Pero no hay ninguno. Entonces el error se "atasca". No hay código para manejarlo.

En la práctica, al igual que con los errores regulares no controlados en el código, significa que algo ha salido terriblemente mal.

¿Qué sucede cuando ocurre un error regular y no es detectado por try..catch? El script muere con un mensaje en la consola. Algo similar sucede con los rechazos de promesas no controladas.

El motor de JavaScript rastrea tales rechazos y genera un error global en ese caso. Se puede ver en la consola.

En el buscador podemos cazar esos errores utilizando "unhandledrejection":

```javascript
window.addEventListener('unhandledrejection', function(event) {
  // Dos propiedades especiales:
  alert(event.promise); // [object Promise] - La promesa que generó el error
  alert(event.reason); // Error: Whoops! - El objeto Error que no se pudo manejar
});

new Promise(function() {
  throw new Error("Whoops!");
}); // No .catch
```

Al no existir un .catch, "unhandledrejection" se activa. Normalmente estos errores no se pueden recuperar, así que lo mejor es informar del fallo. En entornos sin buscador como Node.js hay otras maneras de cazar estos errores.

<h1>Promise API</h1>

<h2>Promise.all</h2>

Sirve para ejecutar varias promesas en paralelo y esperar hasta que estén todas listas. La sintaxis es:

```javascript
let promise = Promise.all([...promises...]);
```

Toma un vector de promesas como parámetro y retorna una promesa. Dicha promesa se resuelve cuando todas acaben y el vector de sus resultados es el parámetro devuelto.

```javascript
Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 3000)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 2000)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 1000))  // 3
]).then(alert); // 1,2,3
```

El orden del vector resultante es igual al de las promesas aunque estas tengan tiempos distintos de resolución.

Un truco común es mapear un conjunto de datos de trabajo en un conjunto de promesas, y luego envolverlo en Promise.all.

```javascript
let urls = [
  'https://api.github.com/users/Gandares',
  'https://api.github.com/users/pepe',
  'https://api.github.com/users/juan'
];

// mapear cada url a un fetch(url) (recordar que fetch devuelve una promesa)
let requests = urls.map(url => fetch(url));

// Promise.all espera hasta que acabe cada promesa
Promise.all(requests)
  .then(responses => responses.forEach(
    response => alert(`${response.url}: ${response.status}`)
  ));
```

Un ejemplo más grande es obtener con un vector de usuarios obtener sus datos en formato json de github y a partir de aquí sacar lo que sea.

```javascript
let names = ['Gandares', 'crguezl'];

let requests = names.map(name => fetch(`https://api.github.com/users/${name}`));

Promise.all(requests)
  .then(responses => {
    for(let response of responses) {
      alert(`${response.url}: ${response.status}`); //Muestra url y un 200 si logra conectarse
    }

    return responses;
  })
  .then(responses => Promise.all(responses.map(r => r.json()))) // Se analiza en json
  .then(users => users.forEach(user => { // Mostramos los datos que queramos
    let info = document.createElement('div');
    info = user.login + ": " + user.bio + " con " + user.public_repos + " repositorios -> ";
    document.body.append(info);
    let img = document.createElement('img');
    img.src = user.avatar_url;
    img.style.width = "100px";
    document.body.append(img);
    let p = document.createElement('p')
    document.body.append(p);
  }));
```

Si alguna de las promesas es rechazada, "Promise.all" ignorará los resultados de las promesas restantes. Por eso es bueno usarse para casos de todo o nada, cuando necesitamos todos los resultados aceptados para poder continuar.


<h2>Promise.allSettled</h2>

"Promise.allSettled" espera a que todas las promesas acaben independientemente del resultado. El vector resultado tendrá
 - {status:"fulfilled", value:result}   Para casos exitosos.
 - {status:"rejected", reason:error}    Para errores.
 
 ```javascript
 let urls = [
  'https://api.github.com/users/Gandares',
  'https://api.github.com/users/crguezl',
  'https://no-such-url'
];

Promise.allSettled(urls.map(url => fetch(url)))
  .then(results => {
    results.forEach((result, num) => {
      if (result.status == "fulfilled") {
        alert(`${urls[num]}: ${result.value.status}`);
      }
      if (result.status == "rejected") {
        alert(`${urls[num]}: ${result.reason}`);
      }
    });
  });
 ```
 
 El vector resultante(results) es el siguiente:
 
 ```javascript
[
  {status: 'fulfilled', value: ...response...},
  {status: 'fulfilled', value: ...response...},
  {status: 'rejected', reason: ...error object...}
]
```
 
Si el buscador no soporta "Promise.allSettled", se debe realizar la técnica del [Polyfill](https://medium.com/beginners-guide-to-mobile-web-development/introduction-to-polyfills-their-usage-9cd6db4b1923), que en este caso no es complicada de hacer.
 
<h2>Promise.race</h2>

Es similar a "Promise.all", pero el resultado será el resolve o reject del primero que acabe:

```javascript
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("Whoops!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).then(alert); // 1
```

El resultado es "1" porque fue el más rapido en resolverse. Las demás promesas son ignoradas.

<h2>Promise.resolve/reject</h2>

<h3>Promise.resolve</h3>

El método crea una promesa resuelta con un valor.

```javascript
let promise = new Promise(resolve => resolve(value));
```

El método se usa para compatibilidad, cuando se espera que una función devuelva una promesa.

```javascript
let cache = new Map();

function loadCached(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url)); // (*)
  }

  return fetch(url)
    .then(response => response.text())
    .then(text => {
      cache.set(url,text);
      return text;
    });
}
```

<h3>Promise.reject</h3>

El método crea una promesa rechazada con un error.

```javascript
let promise = new Promise((resolve, reject) => reject(error));
```

En práctica es casi nunca utilizado.

<h1>Promisificación</h1>

Es la conversión de una función que acepta una "callback" en una función que devuelve una promesa.

Tales transformaciones a menudo son necesarias, ya que muchas funciones y bibliotecas se basan en "callbacks". Pero las promesas son más convenientes, así que tiene sentido promisificarlas.

Usemos el ejemplo de "loadScript()":

```javascript
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`Script load error for ${src}`));

  document.head.append(script);
}

// Modo de uso:
// loadScript('path/script.js', (err, script) => {...})
```

Vamos a promisificarla. La nueva función loadScriptPromise (src) logra el mismo resultado, pero solo acepta src (sin "callback") y devuelve una promesa.

```javascript
let loadScriptPromise = function(src) {
  return new Promise((resolve, reject) => {
    loadScript(src, (err, script) => {
      if (err) reject(err)
      else resolve(script);
    });
  })
}

// Modo de uso:
// loadScriptPromise('path/script.js').then(...)
```

Principalmente logramos una traducción de "callback" a promesa. En la práctica, probablemente necesitemos promisificar muchas funciones, por lo que tiene sentido usar un "helper".

```javascript
function promisify(f) {
  return function (...args) { // return a wrapper-function
    return new Promise((resolve, reject) => {
      function callback(err, result) { // our custom callback for f
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }

      args.push(callback); // append our custom callback to the end of f arguments

      f.call(this, ...args); // call the original function
    });
  };
};

// Modo de uso:
// let loadScriptPromise = promisify(loadScript);
// loadScriptPromise(...).then(...);
```

Esto acepta una función la cual use una "callback" y la promisifica. Aquí suponemos que la función original espera una "callback" con dos argumentos (err, result). Eso es lo que encontramos con más frecuencia. Entonces, nuestra "callback" personalizada está exactamente en el formato correcto, y "prosimify" que funciona muy bien para tal caso.

¿Pero que ocurre si la función f espera más argumentos? Se tendría que hacer otra función, al igual que si en vez de más argumentos, espere menos.

Existen módulos que contienen funciones que promisifican de manera más flexible -> [es6-promisify](https://github.com/digitaldesignlabs/es6-promisify)
