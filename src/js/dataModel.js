// User Events Model
export class DataModel {
  constructor (
    uid,
    session,
    device,
    event,
    videotime,
    timestamp
  ) {
    this.uid = uid;
    this.session = session;
    this.device = device;
    this.event = event;
    this.videotime = videotime;
    this.timestamp = timestamp;
  }
}