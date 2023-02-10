import { dialog } from "@electron/remote";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import type { Atom, Getter } from "jotai";
import { atom, Provider, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import type ZoteroPlugin from "@/zt-main";
import { createInitialValues } from "@/utils/create-initial";

const pluginAtom = atom({} as ZoteroPlugin);

export function atomWithRefresh<T>(fn: (get: Getter) => T) {
  const refreshCounter = atom(0);
  return atom(
    (get) => {
      get(refreshCounter);
      return fn(get);
    },
    (_, set) => {
      set(refreshCounter, (i) => i + 1);
    },
  );
}

const zoteroDataDirAtom = atomWithRefresh(
  (get) => get(pluginAtom).settings.database.zoteroDataDir,
);

const successAtom = atom<boolean | null>(null);

const SetDataDirButton = () => {
  const refresh = useSetAtom(zoteroDataDirAtom);
  const plugin = useAtomValue(pluginAtom);
  const setSuccess = useSetAtom(successAtom);
  const setDataDir = useMemoizedFn(async () => {
    setSuccess(null);
    const { database } = plugin.settings;
    try {
      const {
        filePaths: [newFolder],
      } = await dialog.showOpenDialog({
        defaultPath: database.zoteroDataDir,
        properties: ["openDirectory"],
      });
      if (newFolder && database.zoteroDataDir !== newFolder) {
        await database.setOption("zoteroDataDir", newFolder).apply();
        await plugin.settings.save();
        refresh();
        setSuccess(true);
      } else setSuccess(null);
    } catch (error) {
      console.log("some error", error);
      setSuccess(false);
    }
  });
  return <button onClick={setDataDir}>Select</button>;
};

const DataDirPath = () => {
  const zoteroDataDir = useAtomValue(zoteroDataDirAtom);
  const success = useAtomValue(successAtom);

  return (
    <div
      className={clsx("zotero-data-dir-path", {
        success: success === true,
        failed: success === false,
      })}
    >
      {zoteroDataDir}
    </div>
  );
};

const bbtAtoms = {
  statusAtom: loadable(
    atom(
      async (get) => (
        get(zoteroDataDirAtom), get(pluginAtom).databaseAPI.checkDbStatus("bbt")
      ),
    ),
  ),
  pathAtom: atom(
    (get) => (
      get(zoteroDataDirAtom),
      get(pluginAtom).settings.database.betterBibTexDbPath
    ),
  ),
};
const mainAtoms = {
  statusAtom: loadable(
    atom(
      async (get) => (
        get(zoteroDataDirAtom),
        get(pluginAtom).databaseAPI.checkDbStatus("main")
      ),
    ),
  ),
  pathAtom: atom(
    (get) => (
      get(zoteroDataDirAtom), get(pluginAtom).settings.database.zoteroDbPath
    ),
  ),
};

const DBStatus = ({
  name,
  pathAtom,
  statusAtom,
}: {
  name: string;
  pathAtom: Atom<string>;
  statusAtom: ReturnType<typeof loadable<boolean>>;
}) => {
  const path = useAtomValue(pathAtom);
  const status = useAtomValue(statusAtom);
  const success = status.state === "hasData" && status.data,
    failed =
      (status.state === "hasData" && !status.data) ||
      status.state === "hasError";
  return (
    <div className="setting-item-description">
      {name}: {failed && "(Failed to load)"}
      <div className={clsx("zotero-db-path", { success, failed })}>{path}</div>
    </div>
  );
};

export const DatabaseSetting = ({ plugin }: { plugin: ZoteroPlugin }) => {
  const inital = createInitialValues();
  inital.set(pluginAtom, plugin);
  return (
    <Provider initialValues={inital.get()}>
      <>
        <div className="setting-item-info">
          <div className="setting-item-name">Zotero Data Directory</div>
          <DBStatus name="Zotero" {...mainAtoms} />
          <DBStatus name="Better BibTeX" {...bbtAtoms} />
        </div>
        <div className="setting-item-control">
          <DataDirPath />
          <SetDataDirButton />
        </div>
      </>
    </Provider>
  );
};
