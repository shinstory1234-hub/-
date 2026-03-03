import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-content">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold tracking-tight">머니NPC 소개</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="leading-8 text-muted-foreground">
            머니NPC는 VC심사역, 증권사 등 제도권 금융 현장에서 쌓은 경험을 바탕으로, 투자, 커리어, 시장에 대한 생각을 정리하는 개인 기록 공간입니다.
          </p>

          <div className="rounded-lg border-2 border-danger/50 bg-danger/10 p-4 font-bold leading-7 text-danger">
            <p>모든 글은 개인 의견과 경험에 따른 기록이며, 어떠한 경우에도 특정 종목, 상품, 자산에 대한 매수, 매도, 보유를 권유하지 않습니다.</p>
            <p className="mt-3">본 콘텐츠는 투자 판단의 근거가 될 수 없으며, 모든 투자 결정과 그 결과에 대한 책임은 전적으로 본인에게 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
