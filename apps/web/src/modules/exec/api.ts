"use server";
import { ApiFactory } from "../../global/services/http";
import { type HttpResponse } from "../../global/constants/network";

const ExecAPI = {
  inspectAnExecByID: async (id: string) => ApiFactory.get<HttpResponse>(`/exec/inspectExec/${id}`),
  createAnExecByContainerID: async (id: string, path: string = "/") =>
    ApiFactory.post<HttpResponse>(`/exec/create/containers/${id}`, {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: ["ls", "-la", "--color=never", path],
    }),
};

export default ExecAPI;
