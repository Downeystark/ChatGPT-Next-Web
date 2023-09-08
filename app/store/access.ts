import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_API_HOST, DEFAULT_MODELS, StoreKey } from "../constant";
import { getHeaders } from "../client/api";
import { BOT_HELLO } from "./chat";
import { getClientConfig } from "../config/client";
import { nanoid } from "nanoid";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  needCode: boolean;
  hideUserApiKey: boolean;
  hideBalanceQuery: boolean;
  disableGPT4: boolean;

  openaiUrl: string;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  updateOpenAiUrl: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;

  qrToken: string,
  qrTokenInfo: object,
  updateQrToken: () => void;
  updateQrTokenInfo: (_: object) => void;
  fetchQrToken: () => any;
  fetchQrTokenInfo: () => any;
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      needCode: true,
      hideUserApiKey: false,
      hideBalanceQuery: false,
      disableGPT4: false,

      openaiUrl: DEFAULT_OPENAI_URL,

      enabledAccessControl() {
        get().fetch();

        return get().needCode;
      },
      updateCode(code: string) {
        set(() => ({ accessCode: code?.trim() }));
      },
      updateToken(token: string) {
        set(() => ({ token: token?.trim() }));
      },
      updateOpenAiUrl(url: string) {
        set(() => ({ openaiUrl: url?.trim() }));
      },
      isAuthorized() {
        get().fetch();

        // has token or has code or disabled access control
        return (
          !!get().token || !!get().qrToken|| !!get().accessCode || !get().enabledAccessControl()
        );
      },
      fetch() {
        if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
            console.log("[Config] got config from server", res);
            set(() => ({ ...res }));

            if (res.disableGPT4) {
              DEFAULT_MODELS.forEach(
                (m: any) => (m.available = !m.name.startsWith("gpt-4")),
              );
            }
          })
          .catch(() => {
            console.error("[Config] failed to fetch config");
          })
          .finally(() => {
            fetchState = 2;
          });
      },

      // 微信二维码登录逻辑
      qrToken: nanoid(32),
      qrTokenInfo: {},
      updateQrToken() {
        set(() => ({ qrToken: nanoid(32) }));
      },
      updateQrTokenInfo(tokenInfo: object) {
        set(() => ({ qrTokenInfo: tokenInfo }));
      },
      async fetchQrToken() {
        return await (await fetch("/api/mp/qrcode?code=" + get().qrToken, {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })).json();
      },
      async fetchQrTokenInfo() {
        const res: any = await (await fetch("/api/mp/qrtoken?code=" + get().qrToken, {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })).json();
        if (res.status === 1 && res.data.length) {
          const tokenInfo = res.data[0];
          tokenInfo.value = JSON.parse(tokenInfo.value);
          get().updateQrTokenInfo(tokenInfo);
        }
        return res;
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
