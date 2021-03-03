# odinbook

A facebook clone using [Express](http://expressjs.com/) on [NodeJS](https://nodejs.org/). The purpose of this exercise is to demonstrate RESTful APIs and to bring together a number of backend technologies. Profile pictures are uploaded to the server using [multer](https://github.com/expressjs/multer), 'likes' are send through [request](https://github.com/request/request). Authentication is done with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken). Users can login using facebook. User details and profile picture are imported from facebook then the login is handed off seamlessly to [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

Live server: [https://powerful-taiga-49521.herokuapp.com/](https://powerful-taiga-49521.herokuapp.com/)

This is a solution to the [Odin-Book](https://www.theodinproject.com/courses/nodejs/lessons/odin-book) project, a component of [The Odin Project](https://www.theodinproject.com/) full stack web development course.
