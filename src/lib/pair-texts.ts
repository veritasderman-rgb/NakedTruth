// Wording of the paywall: the detailed report's, with the couple texts on top.
export function pairOfferTexts(report: Record<string, string>, x: Record<string, string>): Record<string, string> {
  return {
    ...report,
    teaserTitle: x.pairTeaserTitle,
    teaserLead: x.pairTeaserLead,
    item1: x.pairItem1,
    item2: x.pairItem2,
    item3: x.pairItem3,
    item4: x.pairItem4,
    item5: x.pairItem5,
    buy: x.pairBuy,
    oneTime: x.pairOneTime,
    open: x.pairOpen,
  };
}

