import { BASE_URL } from "../../global/constants/network";
import createEvent from "../../global/reactivity/createEvent";

const EventStream = {
  streamDockerEvents: () => createEvent(BASE_URL, "/events/streamEvents"),
};

export default EventStream;
