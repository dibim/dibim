// ========== 常用字符串 | Common strings ==========

export const APP_NAME = "DIBIM";
export const APP_VERSION = "v0.4.2";
export const STR_EMPTY = "";
export const STR_ADD = "add";
export const STR_EDIT = "edit";
export const STR_DELETE = "delete";

export const STR_FIELD = "field";
export const STR_TABLE = "table";

// ========== 样式 | styles ==========

// header 的 h- 属性值, 对应 tailwindcss 的
// The h-attribute value of the header corresponds to the tailwindcss
export const HEDAER_H = 12;
// 列表默认宽度 | Default width of list bar
export const LIST_BAR_DEFAULT_WIDTH = 280;
// 多列布局的 resizer 的宽度
export const GUTTER_SIZE = 5; // 和 css 里的一致

// ========== 配置文件相关 | Configuration file related ==========

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

// ========== 布局 | Layout ==========

// 列表栏的类型 | Type of List Bar
export const LIST_BAR_DB = "listBarDb";
export const LIST_BAR_FUNC = "listBarFunc";
export const LIST_BAR_TABLE = "listBarTable";
export const LIST_BAR_VIEW = "listBarView";

// 主要区域的类型 | Types of main area
export const MAIN_AREA_ADD_CONNECTION = "mainAreaAddConnection";
export const MAIN_AREA_EDIT_CONNECTION = "mainAreaEditConnection";
export const MAIN_AREA_SETTINGS = "mainAreaSettings";
export const MAIN_AREA_SQL_EDITOR = "mainAreaSqlEditor";
export const MAIN_AREA_TABLE_EDITOR = "mainAreaTableEditor";
export const MAIN_AREA_WELCOME = "mainAreaWelcome";

// 主要区域的标签页 | Tabs for main area
export const MAIN_AREA_TAB_CONSTRAINT = "mainAreaTabConstraint";
export const MAIN_AREA_TAB_DATA = "mainAreaTabData";
export const MAIN_AREA_TAB_DDL = "mainAreaTabDdl";
export const MAIN_AREA_TAB_FOREIGN_KEY = "mainAreaTabForeignKey";
export const MAIN_AREA_TAB_PARTITION = "mainAreaTabPartition";
export const MAIN_AREA_TAB_STRUCTURE = "mainAreaTabStructure";

// ========== 正则 | Regular Expression ==========

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

// ========== 其它 | Other ==========

// 方向 | Direction
export const DIR_H = "horizontal";
export const DIR_V = "vertical";

// 分页 | Pagination
export const DEFAULT_PAGE_SIZE = 50;

// 新添加的行的标记, 这是一个非法的 sql 字段名, 避免和已有的字段名重名
// The tag for the newly added row is an invalid SQL field name, chosen to avoid conflicts with existing field names.
export const NEW_ROW_IS_ADDED_FIELD = "; -- IS-NEW-ROW -- ;";

//
export const ERROR_FROM_DB_PREFIX = "error returned from database: ";
