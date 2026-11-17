import { BASE_URL } from "../../global/constants/network";
import createEvent from "../../global/reactivity/createEvent";

const ContainerStream = {
  streamContainerLogs: (id: string) => createEvent(BASE_URL , `/containers/getContainerLogs/${id}`)
};

export default ContainerStream;
