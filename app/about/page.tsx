import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="about-wrapper">
      <Card>
        <CardHeader className="about-card-header">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">머니NPC 소개</h1>
        </CardHeader>
        <CardContent className="about-card-content space-y-5">
          <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            머니NPC는 VC심사역, 증권사 등 제도권 금융 현장에서 쌓은 경험을 바탕으로, 투자, 커리어, 시장에 대한 생각을 정리하는 개인 기록 공간입니다.
          </p>

          <div className="rounded-lg border border-border bg-surface p-4 space-y-2 md:p-5">
            <p className="text-sm font-bold text-foreground">🧪 머니NPC 액티브 ETF란?</p>
            <div className="text-sm leading-7 text-muted-foreground space-y-2">
              <p>이 블로그는 단순한 투자 기록을 넘어, <strong className="text-foreground">나만의 액티브 ETF</strong>를 설계하고 운용하는 실험적 프로젝트입니다.</p>
              <p>국내주식, 미국주식, 매크로, 파생상품 등 다양한 자산군을 분석하고, 그 인사이트를 바탕으로 포트폴리오를 직접 구성·운용합니다.</p>
              <p>모든 매매는 <strong className="text-foreground">모의투자</strong>로 진행되며, 실제 수익률과 포트폴리오 현황은 포트폴리오 탭에서 확인할 수 있습니다.</p>
              <p className="text-xs text-muted-foreground">📡 포트폴리오 데이터는 모의투자 API를 통해 매일 <strong className="text-foreground">오후 6시경</strong> 자동으로 업데이트됩니다.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 space-y-2 md:p-5">
            <p className="text-sm font-bold text-foreground">📋 운용 철학</p>
            <ul className="text-sm leading-7 text-muted-foreground list-disc list-inside space-y-1 md:text-base md:leading-8 md:space-y-2">
              <li>기술적(차트) 분석을 통한 매매</li>
              <li>데이터와 논리에 기반한 의사결정</li>
              <li>매크로 환경 분석을 통한 자산 배분</li>
              <li>감정이 아닌 프로세스로 운용</li>
              <li>투명한 기록과 복기를 통한 성장</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-danger/50 bg-danger/10 p-4 space-y-2 md:p-5 md:space-y-3">
            <p className="text-sm font-extrabold text-danger">⚠️ 중요 면책 고지 (Disclaimer)</p>
            <div className="text-xs leading-6 text-danger/90 space-y-2 md:text-sm md:leading-7">
              <p>본 블로그의 모든 콘텐츠는 <strong>개인적인 기록 및 학습 목적</strong>으로만 작성되었으며, 어떠한 경우에도 <strong>투자 권유, 매수·매도·보유 추천</strong>으로 해석될 수 없습니다.</p>
              <p>본 콘텐츠는 <strong>투자 판단의 근거로 사용될 수 없으며</strong>, 모든 투자 결정과 그 결과에 대한 <strong>책임은 전적으로 투자자 본인</strong>에게 있습니다.</p>
              <p>포트폴리오는 <strong>모의투자</strong>로 운용되며, 실제 투자 성과와 다를 수 있습니다. 과거 수익률이 미래 수익률을 보장하지 않습니다.</p>
              <p>금융투자상품은 원금 손실이 발생할 수 있으며, 투자 전 <strong>본인의 투자 성향과 리스크를 반드시 확인</strong>하시기 바랍니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </section>
  );
}
