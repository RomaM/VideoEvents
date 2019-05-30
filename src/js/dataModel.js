// User Events Model
export default class DataModel {
  constructor (
    uid,
    location,
    session,
    date,
    device,
    event,
    videotime,
    timestamp
  ) {
    this.uid = uid;
    this.location = location;
    this.session = session;
    this.date = date;
    this.device = device;
    this.event = event;
    this.videotime = videotime;
    this.timestamp = timestamp;
  }
}