import { Binary, Box, Braces, Brackets, Clock, DraftingCompass, Network, Search, Type } from "lucide-react";
import LogoNum from "@/assets/field_type/123.svg?react";
import LogoRange from "@/assets/field_type/range.svg?react";
import LogoTf from "@/assets/field_type/tf.svg?react";
import {
  FIELD_TYPE_ARRAY,
  FIELD_TYPE_BINARY,
  FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_CHARACTER,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_GEOMETRIC,
  FIELD_TYPE_JSON,
  FIELD_TYPE_NETWORK,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_RANGE,
  FIELD_TYPE_TEXT_SEARCH,
} from "@/constants";
import { getDataTypeCategory } from "@/databases/adapter,";

export function DataTypeIcon(dataType: string) {
  const cate = getDataTypeCategory(dataType);

  if (cate === FIELD_TYPE_NUMERIC) return <LogoNum />;
  if (cate === FIELD_TYPE_CHARACTER) return <Type />;
  if (cate === FIELD_TYPE_BINARY) return <Binary />;
  if (cate === FIELD_TYPE_DATETIME) return <Clock />;
  if (cate === FIELD_TYPE_BOOLEAN) return <LogoTf />;
  if (cate === FIELD_TYPE_GEOMETRIC) return <DraftingCompass />;
  if (cate === FIELD_TYPE_NETWORK) return <Network />;
  if (cate === FIELD_TYPE_TEXT_SEARCH) return <Search />;
  if (cate === FIELD_TYPE_JSON) return <Braces />;
  if (cate === FIELD_TYPE_ARRAY) return <Brackets />;
  if (cate === FIELD_TYPE_RANGE) return <LogoRange />;

  return <Box />;
}
