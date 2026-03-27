import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    `${KIS_MOCK_URL}/uapi/domestic-futureoption/v1/trading/inquire-balance?CANO=${cano}&ACNT_PRDT_CD=${acntPrdtCd}&MGNA_DVSN=01&EXCC_STAT_CD=1&CTX_AREA_FK200=&CTX_AREA_NK200=`,
    {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        appkey: appKey,
        appsecret: appSecret,
        tr_id: "VTFO6118R",
        custtype: "P",
      },
    }
  );
  const data = await res.json();
  return data;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [tokenStock, tokenFuture] = await Promise.all([
      getToken(process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!),
      getToken(process.env.KIS_APP_KEY_FUTURE!, process.env.KIS_APP_SECRET_FUTURE!),
    ]);

    const [stockBalance, futureBalance] = await Promise.all([
      getStockBalance(tokenStock, process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!, process.env.KIS_ACCOUNT_STOCK!),
      getFutureBalance(tokenFuture, process.env.KIS_APP_KEY_FUTURE!, process.env.KIS_APP_SECRET_FUTURE!, process.env.KIS_ACCOUNT_FUTURE!),
    ]);

    const output2 = stockBalance.output2?.[0];
    if (!output2) return NextResponse.json({ error: "No stock data" }, { status: 500 });

    const stockTotalAmt = parseInt(output2.tot_evlu_amt ?? "0");
    const cashAmt = parseInt(output2.dnca_tot_amt ?? "0");
    const stockEvalAmt = parseInt(output2.scts_evlu_amt ?? "0");

    const futureTotalAmt = parseInt(futureBalance?.output2?.tot_dncl_amt ?? "0");

    let futureEvalAmt = 0;
    if (Array.isArray(futureBalance?.output1)) {
      futureEvalAmt = futureBalance.output1.reduce((sum: number, item: Record<string, string>) => {
        return sum + parseInt(item.evlu_amt ?? "0");
      }, 0);
    }

    const INITIAL_AMT = 1000000000;
    const totalEvalAmt = stockTotalAmt + futureTotalAmt;
    const profitLossAmt = totalEvalAmt - INITIAL_AMT;
    const profitLossRate = (profitLossAmt / INITIAL_AMT) * 100;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("portfolio_snapshots").insert({
      total_eval_amt: totalEvalAmt,
      stock_eval_amt: stockEvalAmt,
      cash_amt: cashAmt,
      future_amt: futureTotalAmt,
      future_eval_amt: futureEvalAmt,
      profit_loss_amt: profitLossAmt,
      profit_loss_rate: profitLossRate,
    });

    return NextResponse.json({
      ok: true,
      total: totalEvalAmt,
      profitLoss: profitLossAmt,
      profitLossRate: profitLossRate,
      stock: stockTotalAmt,
      future: futureTotalAmt,
      cash: cashAmt,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
