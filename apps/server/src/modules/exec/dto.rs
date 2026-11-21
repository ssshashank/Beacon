use serde_json::{Value, json};

pub struct Exec {
    pub name: String,
    pub modified_date: String,
    pub user_type: String,
    pub size: String,
    pub kind: String,
}

fn to_string(val: &Value) -> String {
    val.as_str().unwrap_or("").to_string()
}

impl Exec {
    pub fn from_json(json: &Value) -> Exec {
        return Exec {
            name: to_string(&json["name"]),
            modified_date: to_string(&json["modified_date"]),
            user_type: to_string(&json["user_type"]),
            size: to_string(&json["size"]),
            kind: to_string(&json["kind"]),
        };
    }

    pub fn to_json(&self) -> Value {
        return json!({
            "name": self.name,
            "modified_date": self.modified_date,
            "user_type": self.user_type,
            "size": self.size,
            "kind": self.kind,
        });
    }
}
