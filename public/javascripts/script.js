const handleLikeClick = (postLikeId) => {
  console.log("You clicked ", postLikeId);
  const Http = new XMLHttpRequest();
  const url="http://localhost:3000/posts/" + postLikeId + "/like";
  Http.open("POST", url);
  Http.send();
  fetch(url)
    .then( res => {
      if (res.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      res.json().then(data => {
        console.log(data);
        document.getElementById(postLikeId + "-number").innerHTML = data.likes;
      });
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}