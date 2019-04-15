// Firebase Configuration Object and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyCXjTF7G_etsxxvdU3yDAm4RWUQW8YzOxc",
  authDomain: "videoevents-e720e.firebaseapp.com",
  databaseURL: "https://videoevents-e720e.firebaseio.com",
  projectId: "videoevents-e720e",
  storageBucket: "videoevents-e720e.appspot.com",
  messagingSenderId: "551679175257"
};
firebase.initializeApp(firebaseConfig);

const Database = {
  database: firebase.database(),

  // Method: Get data from server by a path
  getServerData(pageName, userKey) {
    const serverData = this.database.ref(`UserEvents/${pageName}/${userKey}`);
    return serverData.once('value');
  },

  // Method: Send user data array to a server
  setEvents(data, pageName, userKey) {
    if (userKey) {
      this.database.ref(`UserEvents/${pageName}/${userKey}`).set(data);
    } else {
      const newKey = this.database.ref(`UserEvents/${pageName}`).push().key;
      localStorage.setItem('userKey', newKey);
      this.database.ref(`UserEvents/${pageName}/${newKey}`).set(data);
    }
  }
};

export default Database;
