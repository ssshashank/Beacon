export interface IpamConfigDTO {
  subnet?: string;
  gateway?: string;
}

export interface NetworkContainerDTO {
  name: string;
  endpoint_id: string;
  mac_address: string;
  ipv4_address: string;
  ipv6_address: string;
}

export interface NetworkDTO {
  id: string;
  name: string;
  created?: string;
  scope: string;
  driver: string;
  enable_ipv6: boolean;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  ipam: IpamConfigDTO[];
  containers_count: number;
  containers: Record<string, NetworkContainerDTO>;
  options: Record<string, string>;
  labels: Record<string, string>;
}

export interface NetworkInspectDTO {
  Id: string;
  Name: string;
  Created?: string;
  Scope: string;
  Driver: string;
  EnableIPv6: boolean;
  IPAM?: {
    Driver?: string;
    Options?: Record<string, string>;
    Config?: Array<{
      Subnet?: string;
      Gateway?: string;
    }>;
  };
  Internal?: boolean;
  Attachable?: boolean;
  Ingress?: boolean;
  Containers?: Record<
    string,
    {
      Name: string;
      EndpointID: string;
      MacAddress: string;
      IPv4Address: string;
      IPv6Address: string;
    }
  >;
  Options?: Record<string, string>;
  Labels?: Record<string, string>;
}
