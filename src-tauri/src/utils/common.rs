use colored::*;

///
/// itemitem_codeCode: 显示的内容, 1是头部, 2是正文, 4是尾部, 7是全部
pub fn print_sql(content: &str, item_code: i8) {
    let mut header_text = "Executed SQL start";

    if item_code == 1 && content != "" {
        header_text = content;
    }

    let mut footer_text = "Executed SQL end";
    if item_code == 4 && content != "" {
        footer_text = content;
    }

    // header
    if item_code == 1 || item_code == 7 {
        print!(
            "\n{} {} {}\n",
            "=".repeat(10).bright_blue(),
            header_text.bright_green(),
            "=".repeat(10).bright_blue(),
        );
    }

    // main content
    if item_code == 2 || item_code == 7 {
        print!("{}", content);
    }

    // footer
    if item_code == 4 || item_code == 7 {
        print!(
            "\n{} {} {}",
            "=".repeat(10).bright_green(),
            footer_text.bright_blue(),
            "=".repeat(10).bright_green(),
        );
    }
}
