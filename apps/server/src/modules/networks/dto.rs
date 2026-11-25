use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IpamConfig {
    pub subnet: Option<String>,
    pub gateway: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkContainer {
    pub name: String,
    pub endpoint_id: String,
    pub mac_address: String,
    pub ipv4_address: String,
    pub ipv6_address: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Network {
    pub id: String,
    pub name: String,
    pub created: Option<String>,
    pub scope: String,
    pub driver: String,
    pub enable_ipv6: bool,
    pub internal: bool,
    pub attachable: bool,
    pub ingress: bool,
    pub ipam: Vec<IpamConfig>,
    pub containers_count: usize,
    pub containers: HashMap<String, NetworkContainer>,
    pub options: HashMap<String, String>,
    pub labels: HashMap<String, String>,
}

impl Network {
    pub fn from_json(json: &Value) -> Self {
        let id = json
            .get("Id")
            .or_else(|| json.get("id"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let name = json
            .get("Name")
            .or_else(|| json.get("name"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let created = json
            .get("Created")
            .or_else(|| json.get("created"))
            .and_then(Value::as_str)
            .map(String::from);

        let scope = json
            .get("Scope")
            .or_else(|| json.get("scope"))
            .and_then(Value::as_str)
            .unwrap_or("local")
            .to_string();

        let driver = json
            .get("Driver")
            .or_else(|| json.get("driver"))
            .and_then(Value::as_str)
            .unwrap_or("bridge")
            .to_string();

        let enable_ipv6 = json
            .get("EnableIPv6")
            .or_else(|| json.get("enable_ipv6"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let internal = json
            .get("Internal")
            .or_else(|| json.get("internal"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let attachable = json
            .get("Attachable")
            .or_else(|| json.get("attachable"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let ingress = json
            .get("Ingress")
            .or_else(|| json.get("ingress"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let mut ipam = Vec::new();
        if let Some(configs) = json
            .get("IPAM")
            .or_else(|| json.get("ipam"))
            .and_then(|ipam| ipam.get("Config").or_else(|| ipam.get("config")))
            .and_then(Value::as_array)
        {
            for c in configs {
                let subnet = c
                    .get("Subnet")
                    .or_else(|| c.get("subnet"))
                    .and_then(Value::as_str)
                    .map(String::from);
                let gateway = c
                    .get("Gateway")
                    .or_else(|| c.get("gateway"))
                    .and_then(Value::as_str)
                    .map(String::from);
                ipam.push(IpamConfig { subnet, gateway });
            }
        }

        let mut containers = HashMap::new();
        if let Some(obj) = json
            .get("Containers")
            .or_else(|| json.get("containers"))
            .and_then(Value::as_object)
        {
            for (cid, val) in obj {
                let cname = val
                    .get("Name")
                    .or_else(|| val.get("name"))
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string();
                let endpoint_id = val
                    .get("EndpointID")
                    .or_else(|| val.get("endpoint_id"))
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string();
                let mac_address = val
                    .get("MacAddress")
                    .or_else(|| val.get("mac_address"))
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string();
                let ipv4_address = val
                    .get("IPv4Address")
                    .or_else(|| val.get("ipv4_address"))
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string();
                let ipv6_address = val
                    .get("IPv6Address")
                    .or_else(|| val.get("ipv6_address"))
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string();

                containers.insert(
                    cid.clone(),
                    NetworkContainer {
                        name: cname,
                        endpoint_id,
                        mac_address,
                        ipv4_address,
                        ipv6_address,
                    },
                );
            }
        }

        let containers_count = containers.len();

        let mut options = HashMap::new();
        if let Some(obj) = json
            .get("Options")
            .or_else(|| json.get("options"))
            .and_then(Value::as_object)
        {
            for (k, v) in obj {
                if let Some(s) = v.as_str() {
                    options.insert(k.clone(), s.to_string());
                }
            }
        }

        let mut labels = HashMap::new();
        if let Some(obj) = json
            .get("Labels")
            .or_else(|| json.get("labels"))
            .and_then(Value::as_object)
        {
            for (k, v) in obj {
                if let Some(s) = v.as_str() {
                    labels.insert(k.clone(), s.to_string());
                }
            }
        }

        Network {
            id,
            name,
            created,
            scope,
            driver,
            enable_ipv6,
            internal,
            attachable,
            ingress,
            ipam,
            containers_count,
            containers,
            options,
            labels,
        }
    }
}
