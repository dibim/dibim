import { Binary, Box, Braces, Brackets, Clock, DraftingCompass, Network, Type } from "lucide-react";
import LogoNum from "@/assets/field_type/123.svg?react";
import LogoRange from "@/assets/field_type/range.svg?react";
import LogoTf from "@/assets/field_type/tf.svg?react";
import {
  FIELD_ARRAY,
  FIELD_BINARY,
  FIELD_BOOLEAN,
  FIELD_CHARACTER,
  FIELD_DATETIME,
  FIELD_GEOMETRIC,
  FIELD_JSON,
  FIELD_NETWORK,
  FIELD_NUMERIC,
  FIELD_RANGE,
} from "@/constants";
import { getDataTypeCategory } from "@/databases/adapter,";

export function DataTypeIcon(dataType: string) {
  const cate = getDataTypeCategory(dataType);

  if (cate === FIELD_NUMERIC) return <LogoNum />;
  if (cate === FIELD_CHARACTER) return <Type />;
  if (cate === FIELD_BINARY) return <Binary />;
  if (cate === FIELD_DATETIME) return <Clock />;
  if (cate === FIELD_BOOLEAN) return <LogoTf />;
  if (cate === FIELD_GEOMETRIC) return <DraftingCompass />;
  if (cate === FIELD_NETWORK) return <Network />;
  if (cate === FIELD_JSON) return <Braces />;
  if (cate === FIELD_ARRAY) return <Brackets />;
  if (cate === FIELD_RANGE) return <LogoRange />;

  return <Box />;
}
