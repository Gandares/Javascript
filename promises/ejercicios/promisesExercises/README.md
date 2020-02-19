# Re-resolve a promise?

What’s the output of the code below?

```javascript
let promise = new Promise(function(resolve, reject) {
  resolve(1);

  setTimeout(() => resolve(2), 1000);
});

promise.then(alert);
```

# Delay with a promise

The built-in function setTimeout uses callbacks. Create a promise-based alternative.

The function delay(ms) should return a promise. That promise should resolve after ms milliseconds, so that we can add .then to it, like this:

```javascript
function delay(ms) {
  // your code
}

delay(3000).then(() => alert('runs after 3 seconds'));
```

# Animated circle with promise

Rewrite the showCircle function in the solution of the task Animated circle with callback so that it returns a promise instead of accepting a callback.
