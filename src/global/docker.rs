pub struct DockerEndpoints;

impl DockerEndpoints {
    pub const GET_ALL_CONTAINERS: &'static str = r"/containers/json?all=true";
}
