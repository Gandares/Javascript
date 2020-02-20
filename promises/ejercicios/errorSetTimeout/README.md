# Error in setTimeout

What do you think? Will the .catch trigger? Explain your answer.

```javascript
new Promise(function(resolve, reject) {
  setTimeout(() => {
    throw new Error("Whoops!");
  }, 1000);
}).catch(alert);
```

<h3>Respuesta</h3>

No lo cazará porque el error no es generado cuando la función "ejecutor" es ejecutado, sino después.
