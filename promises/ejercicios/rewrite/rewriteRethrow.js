class HttpError extends Error {
    constructor(response) {
      super(`${response.status} for ${response.url}`);
      this.name = 'HttpError';
      this.response = response;
    }
}
  
async function loadJson(url) {
    let result = await fetch(url);
    if (result.status == 200) {
        let json = await result.json();
        return json;
    } else {
        throw new HttpError(result);
    }
}   
  
// Preguntar al usuario por un usuario de github
async function demoGithubUser() {
    let name = prompt("Enter a name?", "Gandares");
    await loadJson(`https://api.github.com/users/${name}`);
    alert(`Full name: ${user.name}.`);
    return user;
}

demoGithubUser()
    .catch(err => {
        if (err instanceof HttpError && err.response.status == 404) {
            alert("No such user, please reenter.");
        } else {
            throw err;
        }
    });