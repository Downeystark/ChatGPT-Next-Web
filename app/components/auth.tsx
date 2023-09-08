import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import { LoginByQrcode } from "./login.qrcode";

export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();
  const [tg, setTg] = useState(false);

  const goHome = () => navigate(Path.Home);

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon onClick={ () => setTg(!tg) }/>
      </div>

      {
        tg ?
          (
            <>
              <div className={ styles["auth-title"] }>{ Locale.Auth.Title }</div>
              <div className={ styles["auth-tips"] }>{ Locale.Auth.Tips }</div>

              <input
                className={ styles["auth-input"] }
                type="password"
                placeholder={ Locale.Auth.Input }
                value={ access.accessCode }
                onChange={ (e) => {
                  access.updateCode(e.currentTarget.value);
                } }
              />
            </>
          )
          :
          (
            <>
              <div className={ styles["auth-title"] }>需要登录</div>
              <div className={ styles["auth-tips"] }>管理员开启了登录验证，请用微信扫码关注登录</div>
            </>
          )
      }

      <div className={styles["auth-actions"]}>
        {
          tg ?
            (
              <>
                <IconButton
                  text={ Locale.Auth.Confirm }
                  type="primary"
                  onClick={ goHome }
                />
              </>
            ) :
            (
              <>
                <LoginByQrcode></LoginByQrcode>
              </>
            )
        }

        <IconButton text={Locale.Auth.Later} onClick={goHome} />
      </div>
    </div>
  );
}
