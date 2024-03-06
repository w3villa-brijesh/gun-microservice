
const Gun = require('gun');
// Initialize Gun
var gun = Gun();

// Create nodes for users
var alice = gun.get('user/alice').put({
    name: "Alice",
    age: 30
});

var bob = gun.get('user/bob').put({
    name: "Bob",
    age: 25
});

// Create a post node for Alice
var alicesPost = gun.get('post/alicesFirstPost').put({
    title: "Alice's first post",
    content: "Hello, world!"
});

// Create a post node for Bob
var bobsPost = gun.get('post/bobsAdventure').put({
    title: "Bob's adventure",
    content: "Today I climbed a mountain!"
});

// Link Alice to her post
alice.get('posts').set(alicesPost);


// Link Bob to his post
bob.get('posts').set(bobsPost);

// Add Bob as a friend to Alice
alice.get('friends').set(bob);

// Optionally, add Alice as a friend to Bob
bob.get('friends').set(alice);

bob.put({ age: 288 });

//retrivin data
gun.get('user/bob').on(function(data) {
    console.log(data);
  });

  // Access the 'user/alice' node and log the data
const newData = gun.get('user/alice').once(function(data, key) {
    console.log('Alice\'s data:', data);
});

newData.put({ age: 2888 });
 gun.get('user/alice').once(function(data, key) {
    console.log('Alice\'s data:', data);
});


  
