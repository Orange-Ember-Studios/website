import { createEffect } from "@emberkit/core";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { nord } from "@milkdown/theme-nord";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { history } from "@milkdown/plugin-history";
import { getMarkdown, replaceAll } from "@milkdown/utils";

export function MilkdownField(props: {
  rootId: string;
  /** Remount editor when language tab changes */
  langKey: string;
  initialMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
  /** Called with a snapshot getter after mount; null on teardown (call before save to flush ProseMirror → draft). */
  registerGetMarkdown?: (getMd: (() => string) | null) => void;
  /** Called with a setter after mount so the parent can replace editor content (e.g. after an async fetch). */
  registerSetMarkdown?: (setMd: ((md: string) => void) | null) => void;
}) {
  createEffect(() => {
    void props.langKey;
    const initial = props.initialMarkdown;
    const id = props.rootId;
    let editor: Editor | null = null;
    let cancelled = false;

    void (async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const root = document.getElementById(id);
      if (!root || cancelled) return;
      try {
        editor = await Editor.make()
          .config((ctl) => {
            ctl.set(rootCtx, root);
            ctl.set(defaultValueCtx, initial);
            ctl
              .get(listenerCtx)
              .markdownUpdated((_c, markdown, prevMarkdown) => {
                if (markdown !== prevMarkdown)
                  props.onMarkdownChange(markdown);
              });
          })
          .use(nord)
          .use(commonmark)
          .use(listener)
          .use(history)
          .create();
        if (cancelled) {
          void editor.destroy(true);
          editor = null;
          return;
        }
        props.registerGetMarkdown?.(() => editor!.action(getMarkdown()));
        props.registerSetMarkdown?.((md: string) => {
          if (editor) editor.action(replaceAll(md));
        });
      } catch (e) {
        console.error("[MilkdownField]", e);
      }
    })();

    return () => {
      cancelled = true;
      props.registerGetMarkdown?.(null);
      props.registerSetMarkdown?.(null);
      void editor?.destroy(true);
      editor = null;
    };
  });

  return <div className="milkdown-wrapper" id={props.rootId} />;
}
