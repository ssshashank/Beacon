import { BASE_URL} from "../../global/constants/network";
import createEvent from "../../global/reactivity/createEvent";

const ExecStreamAPI = {
  createAnExec: (id: string) => createEvent(BASE_URL, `/exec/start/${id}`),
};

export default ExecStreamAPI;
