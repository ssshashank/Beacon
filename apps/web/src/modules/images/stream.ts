import { BASE_URL } from "../../global/constants/network";
import createEvent from "../../global/reactivity/createEvent";

const ImagesStreamAPI = {
  streamImageEvents: () => createEvent(BASE_URL, "/events"),
};

export default ImagesStreamAPI;
