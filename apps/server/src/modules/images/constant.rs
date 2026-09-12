pub struct ImageRoutesName;

impl ImageRoutesName {
    pub const GET_ALL_IMAGES: &'static str = r"/getAllImages";
    pub const INSPECT_IMAGE_BY_ID: &'static str = r"/inspectImage/{id}";
    pub const GET_IMAGE_ATTESTATION_BY_ID: &'static str = r"/getImageAttestation/{id}";
    pub const GET_IMAGE_HISTORY_BY_ID: &'static str = r"/getImageHistory/{id}";
}
