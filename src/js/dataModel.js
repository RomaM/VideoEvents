// User Events Model
export default class DataModel {
  constructor (
    uid,
    session,
    date,
    device,
    event,
    videotime,
    timestamp
  ) {
    this.uid = uid;
    this.session = session;
    this.date = date;
    this.device = device;
    this.event = event;
    this.videotime = videotime;
    this.timestamp = timestamp;
  }
}