// Firebase Configuration Object and Initialization

const WPBD = {
  hostname: 'https://staging.marketingvideos-dashboard.com',

  // Method: Send user data array to a server
  setEvents(data, pageName, metaData) {
    const requestBody = {
      'meta-field': JSON.stringify(data),
      status: 'publish'
    };

    return this.getPosts(pageName)
      .then(res => {
        if (res.length && data.length) {
          // console.log('%cREQUEST: ', 'color: blue;', 'PATCH');
          this.setData(requestBody, 'PATCH', res[0].id);
        } else if (data.length) {
          // console.log('%cREQUEST: ', 'color: orange;', 'POST');
          requestBody.title = pageName;
          requestBody.content = {
            raw: JSON.stringify(metaData, null, 4)
          };
          requestBody.categories = [2];
          this.setData(requestBody);
        }
      });
  },

  setData(requestBody, method = 'POST', id = '') {
    const params = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic dmlld2VyOldKaig1eXNwSTYxeGw1VTc4djMja0MzUw==' // viewer
      },
      body: JSON.stringify(requestBody)
    };

    fetch(`${this.hostname}/wp-json/wp/v2/posts/${id}`, params)
      .then( response => {
        if (response.ok) {
          // console.log('%cResponse', 'color: green;', response);
          return response.json();
        }
        throw new Error(`Response from the ${this.hostname} wasn't OK!`);
      })
      .then( data => {
        // console.log('%cData', 'color: green;', data)
      })
      .catch( error => console.log('%cFetch Error: ', 'color: red;', error.message));
  },

  getPosts(pageName) {
    return fetch(`${this.hostname}/wp-json/wp/v2/posts/?slug=${pageName}`, {method: 'GET'})
      .then((response) => {
        return response.json()
      })
      .then( data => data)
      .catch( error  => console.log(error))
  }

};

export default WPBD;
