// Firebase Configuration Object and Initialization

const WPBD = {
  hostname: 'https://staging.marketingvideos-dashboard.com',
  token: '',

  // Method: Get the token from the Dashboard
  getToken() {
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: '', // Pass Dashboard username (NOT ADMIN)
        password: '' // Pass Dashboard password (NOT ADMIN)
      })
    };

    return fetch(`${this.hostname}/wp-json/jwt-auth/v1/token`, params)
      .then( response => response.json())
      .then( response => response.token);
  },

  // Method: Get an exact page if exists
  getPosts(pageName) {
    return fetch(`${this.hostname}/wp-json/wp/v2/posts/?slug=${pageName}`, {method: 'GET'})
      .then( response => response.json())
      .then( data => data)
      .catch( error  => console.log(error))
  },

  // Method: Send user data array to a server
  sendEvents(postId, data, pageName, metaData) {
    const requestBody = {
      'meta-field': JSON.stringify(data),
      status: 'publish'
    };

    if (postId === -1 && data.length) {
      console.log('%cPOST REQUEST: ', 'color: red;', data);
      requestBody.title = pageName;
      requestBody.content = {
        raw: JSON.stringify(metaData, null, 4)
      };
      requestBody.categories = [2];
      return this.setData(requestBody);

    } else if (postId !== '' && data.length) {
      console.log('%cPATCH REQUEST: ', 'color: orange;', data);
      return this.setData(requestBody, 'PATCH', postId);
    }

  },

  // Method: Set params and fetch response
  setData(requestBody, method = 'POST', id = '') {
    const params = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic dmlld2VyOldKaig1eXNwSTYxeGw1VTc4djMja0MzUw==' // Authorization via BASE24 for viewer
        // Authorization: `Bearer ${this.token}` // Authorization via JWT for viewer
      },
      body: JSON.stringify(requestBody)
    };

    return fetch(`${this.hostname}/wp-json/wp/v2/posts/${id}`, params)
      .then( response => {
        if (response.ok) { return response.json() };
        throw new Error(`Response from the ${this.hostname} wasn't OK!`);
      })
      .catch( error => console.log('%cFetch Error: ', 'color: red;', error.message));
  }

};

export default WPBD;
