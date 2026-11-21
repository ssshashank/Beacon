export interface ExecDTO {
  name: string;
  modified_date: string;
  user_type: string;
  size: string;
  kind: "File" | "Folder" | "Link" | string;
}
