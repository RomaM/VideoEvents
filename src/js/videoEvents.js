import {firebaseConfig} from './configs';
import {DataModel} from './dataModel';

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// Video Events Main Class
class VideoEvents {
  constructor(pageName, mainBlock, video, form) {
    this.pageName = pageName;
    this.mainBlock = mainBlock;
    this.video = video;
    this.form = form;
  }

  // Method: User ID creating
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Method: Send user data array to a server
  setEvents(data) {
    let userKey = localStorage.getItem('userKey');
    if (userKey) {
      database.ref(`UserEvents/${this.pageName}/${userKey}`).set(data);
    } else {
      const newKey = database.ref(`UserEvents/${this.pageName}`).push().key;
      localStorage.setItem('userKey', newKey);
      database.ref(`UserEvents/${this.pageName}/${newKey}`).set(data);
    }
  }

  // Method: Get array of events and handle them
  multiEvents(element, eventsArr, handler) {
    if (Array.isArray(eventsArr) && element) {
      eventsArr.forEach(event => {
        element.addEventListener(event, handler);
      });
    } else {
      throw new Error('MultiEvents: Incorrect Data');
    }
  }

  //Method: Add an event to an elements array of a block
  multiElementsEvent(block, tagName, event, handler) {
    const elemArr = block.getElementsByTagName(tagName);
    if (elemArr.length > 0) {
      [...elemArr].forEach(e => e.addEventListener(event, handler));
    }
  }

  // Method: Checking if an element out of screen
  elemOut(elem) {
    const scroll = window.scrollY || window.pageYOffset;
    const boundsTop = elem.getBoundingClientRect().top + scroll;

    const viewport = {
      top: scroll,
      bottom: scroll + window.innerHeight,
    };

    const bounds = {
      top: boundsTop,
      bottom: boundsTop + elem.clientHeight,
    };

    return ( bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom )
      || ( bounds.top <= viewport.bottom && bounds.top >= viewport.top );
  }

  // Method: Get data from server by a path
  getServerData(path) {
    const serverData = database.ref(path);
    return serverData.once('value');
  }

  // Method: Main initialization method for a page
  init() {
    document.addEventListener( 'DOMContentLoaded', () => {
      // Initialization of variables
      let userKey = localStorage.getItem('userKey');
      let uid = localStorage.getItem('userID');
      let session = localStorage.getItem('session') ? localStorage.getItem('session') : 1;
      const device = navigator.userAgent ? navigator.userAgent : '';
      let elemVisibility = this.elemOut(this.video);
      let serverEvents = [];
      let userEvents = [];
      let seekingArr = [];
      const eventsArr =
        ['play', 'pause', 'seeking', 'seeked', 'timeupdate', 'mouseover', 'mouseout', 'volumechange'];
      let interval = null;
      let isMuted = false;
      let formFocus = false;

      // Checking if user exist
      if (!userKey) {
        uid = this.uuidv4();
        localStorage.setItem('userID', uid);
        localStorage.setItem('session', session);
      } else {
        session = ++session;
        localStorage.setItem('session', session);
        this.getServerData(`UserEvents/${this.pageName}/${userKey}`)
          .then(snapshot => {
            if (snapshot.val()) {
              serverEvents = snapshot.val();
            }
          });
      }

      // User has leaved the viewport to top
      this.mainBlock.onmouseleave = event => {
        const scroll = window.scrollY || window.pageYOffset;
        if (event.offsetY - scroll <= 0) {
          const totalArr = serverEvents.concat(userEvents);
          this.setEvents(totalArr);
        }
      };

      // Listen for events on the video block
      this.multiEvents(this.video, eventsArr, (event) => {
        if (userEvents) {
          let data = new DataModel(uid, session, device, event.type, this.video.currentTime, event.timeStamp);

          // if (event.type != 'mouseover' || event.type != 'mouseout' && formFocus) {
          //   formFocus = false;
          // }

          formFocus = false;
          switch (event.type) {
            case 'seeking':
              seekingArr.push(data);
              break;
            case 'seeked':
              const started = seekingArr[0];
              let seeking =
                new DataModel(
                  started.uid,started.session,started.device,started.event,started.videotime,started.timestamp
                );
              userEvents.push(seeking, data);
              seekingArr = [];
              break;
            case 'timeupdate':
              break;
            case 'volumechange':
              if (this.video.volume == 0 || this.video.muted) {
                isMuted = true;
                data.event = 'muted';
                userEvents.push(data);
                console.log('Muted');
              } else if (this.video.volume > 0 && isMuted) {
                isMuted = false;
                data.event = 'unmuted';
                userEvents.push(data);
                console.log('Unmuted');
              }
              break;
            case 'mouseover':
            case 'mouseout':
              // formFocus ? '' : userEvents.push(data);
              break;
            default:
              // let data =
              //   new DataModel(uid, session, device, event.type, this.video.currentTime, event.timeStamp);
              userEvents.push(data);
          }
        }
      });

      // Scroll event. Listen if a user viewport has the video block or not
      window.onscroll = event => {
        if (interval) {
          window.clearTimeout(interval);
          interval = null;
        }

        interval = window.setTimeout(() => {
          if (elemVisibility !== this.elemOut(this.video)) {
            elemVisibility = this.elemOut(this.video);
            let eventType = elemVisibility ? 'ScrollIn' : 'ScrollOut';

            let data =
              new DataModel(uid, session, device, eventType, this.video.currentTime, event.timeStamp);
            userEvents.push(data);
          }
        }, 250);
      };

      // Form focus event. Listen if a user starts to fill the form
      this.multiElementsEvent(this.form, 'input', 'focus', (event) => {
        if (!formFocus) {
          let data =
            new DataModel(uid, session, device, 'formfocus', this.video.currentTime, event.timeStamp);
          userEvents.push(data);
          formFocus = true;
        }
      });

      // Close/Reload tab event. Listen if a user want to close/reload this tab
      // window.onbeforeunload = event => {
      //   if(window.event.returnValue = 'Do you really want to close the window?'){
      //     console.log('%cuser is trying to leave', 'color: #feb606; font-size: 18px');
      //   }
      //   console.log('On BeforeUnload');
      //   this.setEvents(this.userEvents);
      //   console.log(event);
      // };

      // window.onunload = () => {
      //
      // };
    });
  }
}

// Creating a entity of the Video Events Class
var newVideo = new VideoEvents(
  'Test-Page-Name',
  document.getElementsByTagName('body')[0],
  document.getElementById('video'),
  document.getElementById('form'));

// Start Video Events processing
if (newVideo) {
  newVideo.init();
}
