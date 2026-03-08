import { NextResponse } from "next/server";

const KIS_MOCK_URL = "https://openapivts.koreainvestment.com:29443";

async function getToken(appKey: string, appSecret: string) {
  const res = await fetch(`${KIS_MOCK_URL}/oauth2/tokenP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: appKey,
      appsecret: appSecret,
    }),
  });
  const data = await res.json();
  return data.access_token as string;
}

async function getStockBalance(token: string, appKey: string, appSecret: string, accountNo: string) {
  const cano = accountNo.slice(0, 8);
  const acntPrdtCd = accountNo.slice(8);
  const res = await fetch(
    `${KIS_MOCK_URL}/uapi/domestic-stock/v1/trading/inquire-balance?CANO=${cano}&ACNT_PRDT_CD=${acntPrdtCd}&AFHR_FLPR_YN=N&OFL_YN=&INQR_DVSN=02&UNPR_DVSN=01&FUND_STTL_ICLD_YN=N&FNCG_AMT_AUTO_RDPT_YN=N&PRCS_DVSN=01&CTX_AREA_FK100=&CTX_AREA_NK100=`,
    {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        appkey: appKey,
        appsecret: appSecret,
        tr_id: "VTTC8434R",
      },
    }
  );
  return res.json();
}

async function getFutureBalance(token: string, appKey: string, appSecret: string, accountNo: string) {
  const cano = accountNo.slice(0, 8);
  const acntPrdtCd = accountNo.slice(8);
  const res = await fetch(
    `${KIS_MOCK_URL}/uapi/domestic-futureoption/v1/trading/inquire-balance?CANO=${cano}&ACNT_PRDT_CD=${acntPrdtCd}&MGNA_DVSN=01&EXCC_STAT_CD=1`,
    {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        appkey: appKey,
        appsecret: appSecret,
        tr_id: "VFAO310200",
      },
    }
  );
  return res.json();
}

export async function GET() {
  try {
    const [tokenStock, tokenFuture] = await Promise.all([
      getToken(process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!),
      getToken(process.env.KIS_APP_KEY_FUTURE!, process.env.KIS_APP_SECRET_FUTURE!),
    ]);

    const [stockBalance, futureBalance] = await Promise.all([
      getStockBalance(tokenStock, process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!, process.env.KIS_ACCOUNT_STOCK!),
      getFutureBalance(tokenFuture, process.env.KIS_APP_KEY_FUTURE!, process.env.KIS_APP_SECRET_FUTURE!, process.env.KIS_ACCOUNT_FUTURE!),
    ]);

    return NextResponse.json({ ok: true, stock: stockBalance, future: futureBalance });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
