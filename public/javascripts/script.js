const handleLikeClick = async (postLikeId) => {
  const url = "https://powerful-taiga-49521.herokuapp.com/posts/" + postLikeId + "/like";
  const settings = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  try {
    const post = await fetch(url, settings);
    const data = await post.json();
    document.getElementById(postLikeId + "-number").innerHTML = data.likes;
  } catch (e) {
    return e;
  }
}

const handleCommentLikeClick = async (postId, commentLikeId) => {
  const url = "https://powerful-taiga-49521.herokuapp.com/posts/" + postId + "/comments/" + commentLikeId + "/like";
  const settings = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  try {
    const post = await fetch(url, settings);
    const data = await post.json();
    document.getElementById(commentLikeId + "-number").innerHTML = data.likes;
  } catch (e) {
    return e;
  }
}

const handlePostMenuClick = (menuId) => {
  document.getElementById(menuId).classList.toggle("hidden");
}

const handleUserMenuClick = (menuId) => {
  document.getElementById(menuId).classList.toggle("hidden");
}