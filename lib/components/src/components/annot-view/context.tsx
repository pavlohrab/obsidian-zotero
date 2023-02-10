import type { AnnotationInfo } from "@obzt/database";
import type { KeyboardEvent, MouseEvent } from "react";
import { createContext } from "react";
import type { DataModel, StoreAPI } from "./store";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ContextType<R = {}> {
  store: StoreAPI;
  getImgSrc(annotation: AnnotationInfo): string;
  onSetFollow(event: KeyboardEvent | MouseEvent): any;
  annotRenderer: {
    storeSelector(store: DataModel): R;
    get(annot: AnnotationInfo, props: R): (() => string) | null;
  };
  onDragStart(
    evt: React.DragEvent<HTMLDivElement>,
    render: () => string,
    container: HTMLDivElement | null,
  ): any;
  onMoreOptions(
    evt: React.MouseEvent | React.KeyboardEvent,
    annotation: AnnotationInfo,
  ): any;
  registerDbUpdate(callback: () => void): () => void;
  refreshConn(): Promise<void>;
  onShowDetails(itemId: number): any;
}

export const Context = createContext({} as ContextType);
