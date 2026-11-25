pub struct NetworkRoutesName;

impl NetworkRoutesName {
    pub const GET_ALL_NETWORKS: &'static str = r"/getAllNetworks";
    pub const INSPECT_NETWORK_BY_ID: &'static str = r"/inspectNetwork/{id}";
    pub const DELETE_NETWORK_BY_ID: &'static str = r"/delete/{id}";
}
