import type { CloseBracketConfig } from "@codemirror/autocomplete";
import { EditorState, Prec } from "@codemirror/state";
import { editorInfoField } from "obsidian";
import { isEtaFile } from "../utils";

export const bracketExtension = Prec.highest(
  EditorState.languageData.of((state) => {
    const brackets = [];
    // default behavior
    const pb = app.vault.getConfig("autoPairBrackets"),
      pm = app.vault.getConfig("autoPairMarkdown");
    pb && brackets.push("(", "[", "{", "'", '"');
    pm && brackets.push("*", "_", "`", "```");
    // custom match '<' & '%' on eta files
    const fileinfo = state.field(editorInfoField);
    if (fileinfo?.file && isEtaFile(fileinfo?.file)) {
      brackets.push("<", "%");
    }
    const closeBrackets: CloseBracketConfig = {
      brackets,
    };
    return [{ closeBrackets }];
  }),
);
