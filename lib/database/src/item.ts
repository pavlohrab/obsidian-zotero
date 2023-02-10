import { enumerate } from "@obzt/common";
import type { AnnotationPosition, DB, AnnotationItem } from "@obzt/zotero-type";
import { nonRegularItemTypes, CreatorFieldMode } from "@obzt/zotero-type";

export type Item = {
  itemID: number;
  libraryID: number;
  key: string;
  groupID: number | null;
  itemType: string;
};
export type ItemField = {
  itemID: number;
  fieldName: string;
  value: unknown;
};

// #region creator
export interface Creator {
  firstName: string | null;
  lastName: string | null;
  fieldMode: CreatorFieldMode | null;
}
export type CreatorFullName = Record<"firstName" | "lastName", string> &
  Record<"fieldMode", CreatorFieldMode.fullName | null>;
export type CreatorNameOnly = {
  firstName: null;
  lastName: string;
  fieldMode: CreatorFieldMode.nameOnly;
};

export const getCreatorName = (creator: unknown): string | null => {
  if (isCreatorFullName(creator)) {
    return [creator.firstName, creator.lastName].join(" ");
  } else if (isCreatorNameOnly(creator)) {
    return creator.lastName;
  } else return null;
};

export const isCreatorFullName = (item: unknown): item is CreatorFullName => {
  const creator = item as Creator;
  return (
    creator.fieldMode === CreatorFieldMode.fullName &&
    creator.firstName !== null &&
    creator.lastName !== null
  );
};
export const isCreatorNameOnly = (item: unknown): item is CreatorNameOnly => {
  const creator = item as Creator;
  return (
    creator.fieldMode === CreatorFieldMode.nameOnly && creator.lastName !== null
  );
};
// #endregion

export type ItemCreator = {
  itemID: number;
  orderIndex: number;
  creatorType: string | null;
} & Creator;

export type RegularItemInfoBase = Item & {
  creators: Omit<ItemCreator, "itemID">[];
  citekey: string | null;
};
export type RegularItemInfo = RegularItemInfoBase & Record<string, unknown[]>;

export type ItemCitekey = {
  itemID: number;
  citekey: string;
};

type IsNotNullable<T, K> = null extends T ? never : K;
type NotNullableKeys<T> = { [K in keyof T]-?: IsNotNullable<T[K], K> }[keyof T];

export const requiredKeys = new Set(
  enumerate<NotNullableKeys<RegularItemInfoBase>>()(
    "creators",
    "itemID",
    "itemType",
    "key",
    "libraryID",
  ),
);

export type AnnotationInfo = AnnotationItem<Item> &
  Omit<Required<DB.ItemAnnotations>, "position" | "sortIndex"> & {
    sortIndex: number[];
    position: AnnotationPosition;
    /** key of parent item (commonly attachment) */
    parentItem: string;
    parentItemID: number;
  };

export const isRegularItemInfo = (item: unknown): item is RegularItemInfo =>
  !nonRegularItemTypes.includes((item as Item).itemType as never) &&
  typeof (item as Item).key === "string";
export const isAnnotationItem = (item: unknown): item is AnnotationInfo =>
  (item as Item).itemType === "annotation" &&
  !!(item as AnnotationInfo).parentItem;
