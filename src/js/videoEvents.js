/*!
 * @overview velib - Video Events Statistics lib.
*/
import Database from './wpdb';
import DataModel from './dataModel';
import deviceInfo from './deviceInfo';

import 'core-js/features/array/from';
import 'core-js/features/promise';
import 'core-js/features/symbol';

// Video Events Main Class
export class VideoEvents {
  constructor(domain, pageName, mainBlock, video, form, location = '') {
    this.domain = domain.replace(/http:\/\/|https:\/\/|\//g, '');
    this.pageName = pageName;
    this.mainBlock = mainBlock;
    this.video = video;
    this.form = form;
    this.location = location;
    this.postId = '';
    // this.sendingData = {value: false};
    this.sendingData = false;
  }

  // Static Method: Get all data from FireBase
  // static getFBData() {
  //   return Database.getServerData()
  //     .then(snapshot => snapshot.val());
  // }

  // Method: User ID creating
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
  multiElementsEvent(block, elem, event, handler) {
    const elemArr = block.querySelectorAll(elem);
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

  // Method: Converting and sending data to a Server
  convertSend(postId, pageName, userEvents, DB, uid, session, currentDate, device, eventType, eventTS, userCreated) {
    const metaData = {
      'domain': this.domain,
      'videoDuration': this.video.duration
    };

    if (userEvents.arr.length > 0 && !this.sendingData) {
      this.sendingData = true;
      if (!userCreated) { localStorage.setItem('veUserCreated', true); }

      let data = new DataModel(uid, this.location, session, currentDate, device, eventType, this.video.currentTime, eventTS);
      userEvents.arr.push(data);
      DB.sendEvents(postId, userEvents.arr, pageName, metaData).then(
        res => {
          userEvents.arr = [];
          this.postId = res.id;
          this.sendingData = false;

          // if (Object.isFrozen(this.sendingData) === false) {
          //   this.sendingData.value = false;
          //   Object.freeze(this.sendingData);
          // }
        }
      );
    }
  }

  // Method: Main initialization method for a page
  init() {
    document.addEventListener( 'DOMContentLoaded', () => {
      console.log('VE Initialized.');

      const startDate = new Date();

      // Dashboard URL
      const dashbouardUrl = window.location.href;
      if (dashbouardUrl.indexOf('staging') == -1 && dashbouardUrl.indexOf('devel') == -1 && dashbouardUrl.indexOf('localhost') == -1) {
        Database.hostname = 'https://marketingvideos-dashboard.com';
      }

      // Getting JWT from the Dashboard
      // Database.getToken().then( token => {
      //   Database.token = token;
      // });

      let videoName = this.video.src;
      if (!videoName.length) {
        videoName = this.video.getElementsByTagName('source')[0].src;
      }
      videoName = videoName.replace(/http:\/\/|https:\/\/|cdn6.binary.limited|cdn.pushrcdn|.com|.mp4/g, '');
      videoName = videoName.replace(/[/.*+?^${}()|[\]\\]/g, '-');

      let totalName = this.domain + '-pageis-' + this.pageName + '-videonameis-' + videoName;

      // Get post from the dashboard by name
      Database.getPosts(totalName).then( res => {
        if (res.length) {this.postId = res[0].id;}
        else {this.postId = -1;}
      });

      const ctaBtn = this.form.querySelectorAll('input[type="submit"]')[0];
      let userCreated = localStorage.getItem('veUserCreated');
      let uid = localStorage.getItem('veUserID');
      let session = localStorage.getItem('veSession') ? localStorage.getItem('veSession') : 1;
      // Device data. Getting device values
      let device = deviceInfo();
      let currentDate = new Date();
      currentDate = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
      let elemVisibility = this.elemOut(this.video);
      let userEvents = {
        arr: []
      };
      const eventsArr =
        ['play', 'pause', 'seeking', 'seeked', 'timeupdate', 'volumechange', 'ended', 'abort', 'emptied', 'error', 'stalled'];
      let interval = null;
      let isMuted = false;
      let formFocus = false;

      // Checking if user exist
      if (!userCreated) {
        uid = this.uuidv4();
        localStorage.setItem('veUserID', uid);
        localStorage.setItem('veSession', session);
      } else {
        session = ++session;
        localStorage.setItem('veSession', session);

        // Database.getServerData(this.pageName, userKey)
        //   .then(snapshot => {
        //     if (snapshot.val()) serverEvents = snapshot.val();
        // });
      }

      // Listen for events on the video block
      this.multiEvents(this.video, eventsArr, (event) => {
        if (userEvents.arr) {
          let data =
            new DataModel(uid, this.location, session, currentDate, device, event.type, this.video.currentTime, (new Date())-startDate);

            formFocus = false;
            switch (event.type) {
              case 'seeking':
                break;
              case 'seeked':
                userEvents.arr.push(data);
                break;
              case 'timeupdate':
                break;
              case 'volumechange':
                if (this.video.volume == 0 || this.video.muted) {
                  isMuted = true;
                  data.event = 'muted';
                  userEvents.arr.push(data);
                } else if (this.video.volume > 0 && isMuted) {
                  isMuted = false;
                  data.event = 'unmuted';
                  userEvents.arr.push(data);
                }
                break;
              default:
                userEvents.arr.push(data);
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
              new DataModel(uid, this.location, session, currentDate, device, eventType, this.video.currentTime, (new Date())-startDate);
            userEvents.arr.push(data);
          }
        }, 250);
      };

      // Form focus event. Listen if a user starts to fill the form
      this.multiElementsEvent(this.form, 'input:not([type="submit"])', 'focus', (event) => {
        if (!formFocus) {
          let data =
            new DataModel(uid, this.location, session, currentDate, device, 'formfocus', this.video.currentTime, (new Date())-startDate);
          userEvents.arr.push(data);
          formFocus = true;
        }
      });

      // EVENTS FOR SENDING DATA:

      // User came from mobile device. Send data if events exist and no more than once in 5 seconds
      if (device.name.toLowerCase() != 'desktop') {
        let counter = 0;
        setInterval(() => { counter += 5; }, 5000);
        this.mainBlock.addEventListener('touchstart', e => {
          if (userEvents.arr.length > 0 && counter >= 5) {
            counter = 0;
            this.convertSend(
              this.postId, totalName, userEvents, Database, uid, session, currentDate, device, 'mobileTouch', (new Date())-startDate, userCreated
            );

            // if (Object.isFrozen(this.sendingData) === false) {
            //   this.sendingData.value = true;
            // }
          }
        });
      }

      // User has left the viewport to top
      this.mainBlock.addEventListener('mouseleave', event => {
        const scroll = window.scrollY || window.pageYOffset;
        // if (event.offsetY - scroll <= 20 && !this.sendingData.value) {
        if (event.offsetY - scroll <= 20) {
          this.convertSend(
            this.postId, totalName, userEvents, Database, uid, session, currentDate, device, 'userLeave', (new Date())-startDate, userCreated
          );

          // if (Object.isFrozen(this.sendingData) === false) {
          //   this.sendingData.value = true;
          // }
        }
      });

      // User has clicked a CTA
      ctaBtn.addEventListener('click', event => {
        this.convertSend(
          this.postId, totalName, userEvents, Database, uid, session, currentDate, device, 'submit', (new Date())-startDate, userCreated
        );
      });
    });
  }
}

