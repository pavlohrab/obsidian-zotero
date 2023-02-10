import { useRef, useState } from "react";
import { Icon } from "../icon";
import { FieldName } from "./FieldName";
import { FieldValue } from "./FieldValue";

export type NoteFieldsData = Record<string, WithID[]>;

type WithID = { id: string; content: string };

export interface NoteFieldsProps {
  // saving?: boolean;
  data: NoteFieldsData;
  onSave?: (field: string, index: number, id: string) => void;
  onChange: (value: string, field: string, index: number, id: string) => void;
  onDelete: (field: string, index: number, id: string) => void;
  onAdd: (field: string) => void;
}

export function NoteFields({
  data,
  onAdd,
  onDelete,
  onChange,
  onSave,
}: // saving,
NoteFieldsProps) {
  const [editing, setEditing] = useState<{
    field: string;
    index: number;
  } | null>(null);

  // used to check if the data has changed since the last edit
  const beforeEdit = useRef<NoteFieldsData | null>(null);

  return (
    <>
      {/* <div className="nav-header">
        <p
          className={clsx(
            "text-center align-middle transition-opacity",
            !saving && "opacity-0",
          )}
        >
          Saving...
        </p>
      </div> */}
      <nav className="flex-1 overflow-y-auto">
        {Object.entries(data).map(([field, values]) => (
          <div key={field} className="relative">
            <FieldName
              name={field}
              onAdd={() => {
                onAdd(field);
                beforeEdit.current = data;
                setEditing({ field, index: values.length });
              }}
            />
            <ul className="divide-bg-mod-border relative z-0 divide-y">
              {values.map((content, index) => {
                const isEditing =
                  !!editing &&
                  editing.field === field &&
                  editing.index === index;
                return (
                  <FieldValue
                    key={content.id}
                    value={content.content}
                    editing={isEditing}
                    onFocus={() => {
                      if (isEditing) return;
                      beforeEdit.current = data;
                      setEditing({ field, index });
                    }}
                    onBlur={() => {
                      if (!isEditing) return;
                      setEditing(null);
                      if (onSave && beforeEdit.current !== data) {
                        onSave(field, index, content.id);
                      }
                      beforeEdit.current = null;
                    }}
                    onChange={(value) => {
                      onChange(value, field, index, content.id);
                    }}
                    onDelete={() => {
                      onDelete(field, index, content.id);
                    }}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

export function PrepareNote({ onClick }: { onClick: () => void }) {
  return (
    <div className="m-8 justify-self-center text-center">
      <Icon icon="file-warning" size="3rem" />
      <h3 className="text-txt-normal mt-2 text-base font-medium">
        Convert Existing Fields
      </h3>
      <p className="text-txt-muted mt-1 text-sm">
        Normalize your existing fields to work with note fields viewer.
      </p>
      <div className="mt-6">
        <button className="mod-cta" onClick={onClick}>
          Convert
        </button>
      </div>
    </div>
  );
}
