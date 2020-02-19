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
