// APP 相关 | APP related
export const APP_NAME = "DIBIM";
export const APP_VERSION = "v0.3.1";

// 常用字符串 | Common strings
export const STR_EMPTY = "";
export const STR_ADD = "add";
export const STR_EDIT = "edit";
export const STR_DELETE = "delete";

export const STR_FIELD = "field";
export const STR_TABLE = "table";

// 样式 | styles
//
// header 的 h- 属性值, 对应 tailwindcss 的
// The h-attribute value of the header corresponds to the tailwindcss
export const HEDAER_H = 12;
// 列表默认宽度 | Default width of list bar
export const LIST_BAR_DEFAULT_WIDTH = 280;
// 多列布局的 resizer 的宽度
export const GUTTER_SIZE = 5; // 和 css 里的一致

// 配置文件相关 | Configuration file related
//
// 默认主密码 | Default master password
export const MAIN_PASSWORD_DEFAULT = "DIBIM@2025-03-22 08:41^c3dd4147ea11b63c2cd776a0602930692ba34c43$";
// 主密码的最小长度 | Minimum length of master password
export const MAIN_PASSWORD_MIN_LEN = 6;
// 主配置文件 | Main configuration file
export const CONFIG_FILE_MAIN = "./dibim_config.bin";
// 外观配置文件 | Appearance configuration file
export const CONFIG_FILE_APPEARANCE = "./dibim_appearance.json";

// 查询记录 | Query records
export const QUERY_HISTORY_FILE = "./dibim_query_history.bin";

// 数据库类型 | Database type
export const DB_MYSQL = "MySQL";
export const DB_POSTGRESQL = "PostgreSQL";
export const DB_SQLITE = "SQLite";

// 数据库字段类型 | Database field type
export const FIELD_ARRAY = "ARRAY";
export const FIELD_BINARY = "BINARY";
export const FIELD_BIT_STRING = "BIT_STRING";
export const FIELD_BOOLEAN = "BOOLEAN";
export const FIELD_CHARACTER = "CHARACTER";
export const FIELD_DATETIME = "DATETIME";
export const FIELD_GEOMETRIC = "GEOMETRIC";
export const FIELD_JSON = "JSON";
export const FIELD_NETWORK = "NETWORK";
export const FIELD_NUMERIC = "NUMERIC";
export const FIELD_RANGE = "RANGE";
export const FIELD_TEXT_SEARCH = "TEXT_SEARCH";
export const FIELD_OTHER = "OTHER";

// 列表栏的类型 | Type of List Bar
export const LIST_BAR_DB = "dbList";
export const LIST_BAR_FUNC = "funcLst";
export const LIST_BAR_TABLE = "tableList";
export const LIST_BAR_VIEW = "viewList";

// 主要区域的类型 | Types of main area
export const MAIN_AREA_ADD_CONNECTION = "addConnection";
export const MAIN_AREA_EDIT_CONNECTION = "editConnection";
export const MAIN_AREA_SETTINGS = "settings";
export const MAIN_AREA_SQL_EDITOR = "sqlEditor";
export const MAIN_AREA_TABLE_EDITOR = "tableEditor";
export const MAIN_AREA_WELCOME = "welcome";

// 主要区域的标签页 | Tabs for main area
export const TAB_CONSTRAINT = "TAB_CONSTRAINT";
export const TAB_DATA = "TAB_DATA";
export const TAB_DDL = "TAB_DDL";
export const TAB_FOREIGN_KEY = "TAB_FOREIGN_KEY";
export const TAB_PARTITION = "TAB_PARTITION";
export const TAB_STRUCTURE = "TAB_STRUCTURE";

// 方向 | Direction
export const DIR_H = "horizontal";
export const DIR_V = "vertical";

// 正则 | Regular Expression
//
// 是单表查询 | is Single-Table query
export const RE_IS_SINGLET_QUERY =
  /^select\b(?!(.*\bselect\b))(?!.*\b(join|inner\s+join|outer\s+join|left\s+join|right\s+join|cross\s+join|natural\s+join)\b)(?!.*\bfrom\b[^,]*(,[^,]+)+).*$/i;
// 全部由数字组成的字符串 | A string composed entirely of numbers
export const RE_NUM_STR = /^\d+$/;
// 正则表达式用于匹配 WHERE 之后的部分
export const RE_WHERE_CLAUSE = /from\s+("[^"]+"|`[^`]+`|'[^']+'|\w+)(?:\s+(.*))?/i;
// 一个单词
export const RE_ONE_WORD = /^\s*(\S+)\s*$/;
// 两个单词, 中间使用任意空白分割
export const RE_TWO_WORDS = /^\s*(\S+)\s+(\S+)\s*$/;

// 分页 | Pagination
export const DEFAULT_PAGE_SIZE = 50;

//
// 新添加的行的标记, 这是一个非法的 sql 字段名, 避免和已有的字段名重名
// The tag for the newly added row is an invalid SQL field name, chosen to avoid conflicts with existing field names.
export const NEW_ROW_IS_ADDED_FIELD = "; -- IS-NEW-ROW -- ;";
