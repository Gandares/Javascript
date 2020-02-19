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

<h1>Llamando callback en callback</h1>

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
  loadScript('/my/script2.js', function(script) {
    loadScript('/my/script3.js', function(script) {
      // Algo
    });
  });
});
```

Y asi sucesivamente si queremos cargar mas scripts uno detras de otro.
