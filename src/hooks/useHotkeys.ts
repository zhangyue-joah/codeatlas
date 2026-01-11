'use client';

import { useEffect } from 'react';

export interface IHotkey {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (event: KeyboardEvent) => void;
}

function matchesHotkey(event: KeyboardEvent, hotkey: IHotkey): boolean {
  if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) return false;
  if (hotkey.metaKey !== undefined && event.metaKey !== hotkey.metaKey) return false;
  if (hotkey.ctrlKey !== undefined && event.ctrlKey !== hotkey.ctrlKey) return false;
  if (hotkey.shiftKey !== undefined && event.shiftKey !== hotkey.shiftKey) return false;
  if (hotkey.altKey !== undefined && event.altKey !== hotkey.altKey) return false;
  return true;
}

/**
 * 绑定全局快捷键（仅在客户端生效）。
 */
export function useHotkeys(hotkeys: IHotkey[]) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      for (const hotkey of hotkeys) {
        if (matchesHotkey(event, hotkey)) {
          hotkey.handler(event);
          return;
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkeys]);
}

