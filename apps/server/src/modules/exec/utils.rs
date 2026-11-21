use crate::modules::exec::dto::Exec;

pub fn strip_ansi(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\x1b' {
            // Skip CSI sequence: \x1b[...m or other termination char
            if let Some(&'[') = chars.peek() {
                chars.next();
                while let Some(&next) = chars.peek() {
                    chars.next();
                    if next.is_ascii_alphabetic() || next == '@' || next == '~' {
                        break;
                    }
                }
            }
        } else if c == '[' {
            // Also handle raw bracket color codes like [1;34m or [m
            let mut temp = String::new();
            let mut is_code = false;
            let clone = chars.clone();
            for next in clone {
                if next.is_ascii_digit() || next == ';' {
                    temp.push(next);
                } else if next == 'm' {
                    is_code = true;
                    break;
                } else {
                    break;
                }
            }
            if is_code {
                for _ in 0..temp.len() + 1 {
                    chars.next();
                }
            } else {
                result.push(c);
            }
        } else {
            result.push(c);
        }
    }

    result
}

pub fn parse_ls_line(line: &str) -> Option<Exec> {
    // Strip ansi lines
    let cleaned = strip_ansi(line);
    let trimmed = cleaned.trim();
    if trimmed.is_empty() || trimmed.starts_with("total ") {
        return None;
    }

    let tokens: Vec<&str> = trimmed.split_whitespace().collect();
    // A standard `ls -la` line has at least 8 or 9 tokens:
    // permissions, links, owner, group, size, month, day, time/year, name...
    if tokens.len() < 8 {
        return None;
    }

    let perms = tokens[0];
    // Check if the first token looks like permissions string (e.g. drwxr-xr-x or -rw-r--r--)
    if perms.len() < 9 {
        return None;
    }

    let first_char = perms.chars().next()?;
    let kind = match first_char {
        'd' => "Folder",
        'l' => "Folder", // Or Link
        '-' => "File",
        _ => "File",
    };

    let user_type = tokens[2].to_string();

    // Size formatting
    let size_raw = tokens[4];
    let size = if size_raw == "0" {
        "0 kB".to_string()
    } else if let Ok(bytes) = size_raw.parse::<u64>() {
        if bytes < 1024 {
            format!("{} B", bytes)
        } else if bytes < 1024 * 1024 {
            format!("{} kB", bytes / 1024)
        } else {
            format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
        }
    } else {
        size_raw.to_string()
    };

    // Modified date: tokens[5], tokens[6], tokens[7] (e.g. "Nov", "13", "11:33" or "2026")
    let modified_date = if tokens.len() >= 8 {
        format!("{} {} {}", tokens[6], tokens[5], tokens[7])
    } else {
        String::new()
    };

    // Name: tokens from index 8 onwards (or index 7 if Alpine busybox without group column)
    let raw_name = if tokens.len() >= 9 {
        tokens[8..].join(" ")
    } else {
        tokens[7..].join(" ")
    };

    // Strip symlink arrow if present: e.g. "lib -> usr/lib" -> "lib"
    let name = raw_name
        .split(" -> ")
        .next()
        .unwrap_or(&raw_name)
        .trim()
        .to_string();

    // Skip current and parent directory pointers
    if name == "." || name == ".." {
        return None;
    }

    Some(Exec {
        name,
        modified_date,
        user_type,
        size,
        kind: kind.to_string(),
    })
}
