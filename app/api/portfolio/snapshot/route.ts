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

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getToken(process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!);
    const balance = await getStockBalance(token, process.env.KIS_APP_KEY_STOCK!, process.env.KIS_APP_SECRET_STOCK!, process.env.KIS_ACCOUNT_STOCK!);

    const output2 = balance.output2?.[0];
    if (!output2) return NextResponse.json({ error: "No data" }, { status: 500 });

    const totalEvalAmt = parseInt(output2.tot_evlu_amt ?? "0");
    const cashAmt = parseInt(output2.dnca_tot_amt ?? "0");
    const stockEvalAmt = parseInt(output2.scts_evlu_amt ?? "0");
    const profitLossAmt = parseInt(output2.asst_icdc_amt ?? "0");
    const profitLossRate = parseFloat(output2.asst_icdc_erng_rt ?? "0");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("portfolio_snapshots").insert({
      total_eval_amt: totalEvalAmt,
      stock_eval_amt: stockEvalAmt,
      cash_amt: cashAmt,
      profit_loss_amt: profitLossAmt,
      profit_loss_rate: profitLossRate,
    });

    return NextResponse.json({ ok: true, total: totalEvalAmt, cash: cashAmt, stock: stockEvalAmt });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
