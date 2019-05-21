// import Database from './dataBase';
import Database from './wpdb';
import DataModel from './dataModel';
import deviceInfo from './deviceInfo';

// Video Events Main Class
export class VideoEvents {
  constructor(domain, pageName, mainBlock, video, form) {
    this.domain = domain;
    this.pageName = pageName;
    this.mainBlock = mainBlock;
    this.video = video;
    this.form = form;
  }

  // Static Method: Get all data from FireBase
  // static getFBData() {
  //   console.log('Get Data from FB');
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

  // Method: Main initialization method for a page
  init() {
    document.addEventListener( 'DOMContentLoaded', () => {
      console.log('VE Initialized.');

      // Initialization of variables
      // let userKey = localStorage.getItem('veUserKey');
      let userCreated = localStorage.getItem('veUserCreated');
      let uid = localStorage.getItem('veUserID');
      let session = localStorage.getItem('veSession') ? localStorage.getItem('veSession') : 1;
      // Device data. Getting device values
      let device = deviceInfo();
      let currentDate = new Date();
      currentDate = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
      let elemVisibility = this.elemOut(this.video);
      let serverEvents = [];
      let userEvents = [];
      let seekingArr = [];
      const eventsArr =
        ['play', 'pause', 'seeking', 'seeked', 'timeupdate', 'volumechange', 'ended'];
      let interval = null;
      let isMuted = false;
      let formFocus = false;

      // Checking if user exist
      // if (!userKey) {
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

      // User has leaved the viewport to top
      this.mainBlock.onmouseleave = event => {
        const scroll = window.scrollY || window.pageYOffset;
        if (event.offsetY - scroll <= 0) {
          // let totalArr = serverEvents.concat(userEvents);
          // let pageNameDate = `${this.pageName}:date:${currentDate}`;
          // let videoNameDuration = `${this.video.src}:duration:${Math.floor(this.video.duration)}`;
          let videoName = this.video.src;
          if (!videoName.length) {
            videoName = this.video.getElementsByTagName('source')[0].src;
          }
          videoName =
            videoName.replace(/http:\/\/|https:\/\/|cdn6.binary.limited|cdn.pushrcdn|.com|.mp4/g, '');
          videoName = videoName.replace(/[/.*+?^${}()|[\]\\]/g, '-');
          let domainName = this.domain;
          domainName = domainName.replace(/http:\/\/|https:\/\/|\//g, '');
          let pageName = domainName + '-pageis-' + this.pageName + '-videonameis-' + videoName;
          const metaData = {
            'domain': domainName,
            'pageName': this.pageName,
            'videoName': videoName,
            'videoDuration': this.video.duration
          };

          if (userEvents.length) {
            let data = new DataModel(uid, session, currentDate, device, 'userLeave', this.video.currentTime, event.timeStamp);
            userEvents.push(data);
          }

          Database.setEvents(userEvents, pageName, metaData).then(
            () => { userEvents = []; }
          );

          // if (newKey) localStorage.setItem('veUserKey', newKey);
          if (!userCreated) localStorage.setItem('veUserCreated', true);
        }
      };

      // Listen for events on the video block
      this.multiEvents(this.video, eventsArr, (event) => {
        if (userEvents) {
          let data =
            new DataModel(uid, session, currentDate, device, event.type, this.video.currentTime, event.timeStamp);

          // if (event.type != 'mouseover' || event.type != 'mouseout' && formFocus) {
          //   formFocus = false;
          // }

          formFocus = false;
          switch (event.type) {
            case 'seeking':
              // seekingArr.push(data);
              break;
            case 'seeked':
              // const started = seekingArr[0];
              // let seeking =
              //   new DataModel(
              //     started.uid,started.session,started.device,started.event,started.videotime,started.timestamp
              //   );
              // userEvents.push(seeking, data);
              // seekingArr = [];
              userEvents.push(data);
              break;
            case 'timeupdate':
              break;
            case 'volumechange':
              if (this.video.volume == 0 || this.video.muted) {
                isMuted = true;
                data.event = 'muted';
                userEvents.push(data);
              } else if (this.video.volume > 0 && isMuted) {
                isMuted = false;
                data.event = 'unmuted';
                userEvents.push(data);
              }
              break;
            default:
              // let data =
              //   new DataModel(uid, session, currentDate, device, event.type, this.video.currentTime, event.timeStamp);
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
              new DataModel(uid, session, currentDate, device, eventType, this.video.currentTime, event.timeStamp);
            userEvents.push(data);
          }
        }, 250);
      };

      // Form focus event. Listen if a user starts to fill the form
      this.multiElementsEvent(this.form, 'input', 'focus', (event) => {
        if (!formFocus) {
          let data =
            new DataModel(uid, session, currentDate, device, 'formfocus', this.video.currentTime, event.timeStamp);
          userEvents.push(data);
          formFocus = true;
        }
      });
    });
  }
}

