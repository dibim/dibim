use colored::*;

pub fn print_sql(sql: &str) {
    print!(
        "\n{} {} {}\n{}\n{} {} {}",
        "=".repeat(10).bright_blue(),
        "Executed SQL start".bright_green(),
        "=".repeat(10).bright_blue(),
        sql,
        "^".repeat(10).bright_cyan(),
        "Executed SQL end".bright_magenta(),
        "^".repeat(10).bright_cyan(),
    );
}
