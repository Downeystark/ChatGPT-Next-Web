"use client";


require("../polyfill");

import { useState, useEffect } from "react";
import { useAccessStore } from "../store";
import { Loading } from "./home";
import { showToast } from "../components/ui-lib";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";

export function LoginByQrcode() {
  const navigate = useNavigate();
  const goHome = () => navigate(Path.Home);
  const [qrcode, setQrcode] = useState('');

  const refreshQrcode = async () => {
    setQrcode('');
    let { status, info, data } = await useAccessStore.getState().fetchQrToken();
    console.log(status, data);
    if (status !== 0) return showToast(info);
    setQrcode('https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + data.ticket)
  }

  useEffect(() => {
    const timer = setInterval(async _ => {
      let { status, info, data } = await useAccessStore.getState().fetchQrTokenInfo();
      console.log(status, info, data);
      if (status === 1 && data.length) {
        showToast('登录成功');
        clearInterval(timer);
        goHome();
      }
    }, 3000);
    refreshQrcode().then();
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div style={ { width: '250px', height: '250px' } }>
        { !qrcode ?
          (
            <>
              <Loading noLogo/>
            </>
          ) :
          (
            <>
              <img src={ qrcode } onClick={ refreshQrcode } width="100%" height="100%" alt=""/>
            </>
          )
        }
      </div>
      <div style={ { textAlign: 'center' } }>微信扫码登录</div>
    </div>
  );
}
