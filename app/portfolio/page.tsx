export const revalidate = 3600; // 1시간 캐시 (KIS API + 스냅샷 모두 하루 1회 갱신)
import { createClient } from "@supabase/supabase-js";
import { PortfolioPageClient } from "@/components/portfolio-page-client";

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

async function getHoldings(token: string, appKey: string, appSecret: string, accountNo: string) {
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
  const data = await res.json();
  return data.output1 ?? [];
}

async function getLatestSnapshot() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export default async function PortfolioPage() {
  const [snapshot, token] = await Promise.all([
    getLatestSnapshot(),
    getToken(
      process.env.KIS_APP_KEY_STOCK!,
      process.env.KIS_APP_SECRET_STOCK!
    ),
  ]);

  const holdings = await getHoldings(
    token,
    process.env.KIS_APP_KEY_STOCK!,
    process.env.KIS_APP_SECRET_STOCK!,
    process.env.KIS_ACCOUNT_STOCK!
  );

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">포트폴리오</h1>
        <p className="text-sm text-muted-foreground mt-1">머니NPC 모의투자 현황</p>
      </div>
      <PortfolioPageClient snapshot={snapshot} holdings={holdings} />
    </section>
  );
}
