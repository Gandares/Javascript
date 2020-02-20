# Promise: then versus catch

Are these code fragments equal? In other words, do they behave the same way in any circumstances, for any handler functions?

```javascript
promise.then(f1).catch(f2);
```

Versus:

```javascript
promise.then(f1, f2);
```

<h3>Respuesta</h3>

Comprobando el código, es cierto que ambos llegan a un mismo resultado. Pero la diferencia es que en el primer trozo de código, .then pasa el resultado/error al siguiente manejador. Sin embargo en el segundo caso no hay un .catch, asi que el error no está manejado correctamente.
