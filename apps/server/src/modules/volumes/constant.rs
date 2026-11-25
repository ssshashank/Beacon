pub struct VolumeRoutesName;

impl VolumeRoutesName {
    pub const GET_ALL_VOLUMES: &'static str = r"/getAllVolumes";
    pub const INSPECT_VOLUME_BY_NAME: &'static str = r"/inspectVolume/{name}";
    pub const DELETE_VOLUME_BY_NAME: &'static str = r"/delete/{name}";
}
