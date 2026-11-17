export default function createEvent(baseURI: string, url:string) {
  const es = new EventSource(baseURI + url);
  return es;
};
