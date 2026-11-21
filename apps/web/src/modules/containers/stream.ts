import { BASE_URL } from "../../global/constants/network";
import createEvent from "../../global/reactivity/createEvent";

const ContainerStream = {
  streamContainerLogs: (id: string) => createEvent(BASE_URL , `/containers/getContainerLogs/${id}`),
  streamFileSystem: (id: string, path: string = "/") =>
    createEvent(BASE_URL, `/containers/fileSystem/${id}?path=${encodeURIComponent(path)}`),
};

export default ContainerStream;
