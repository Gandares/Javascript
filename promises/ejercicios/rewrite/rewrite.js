async function loadJson(url) {
    let result = await fetch(url);
    if (result.status == 200) {
        let json = await result.json();
        return json;
    }else{
        throw new Error(response.status);
    }
}
  
loadJson('no-such-user.json')
    .catch(err => console.log(err)); // Error: 404