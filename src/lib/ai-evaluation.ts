import type { Parameter, School, AnalysisData } from '@/lib/types';

export interface SchoolComparison {
  school: School;
  total: number;
  maxPossible: number;
  average: number;
  filledCount: number;
  topParams: { param: Parameter; grade: number }[];
  weakParams: { param: Parameter; grade: number }[];
  paramGrades: Record<string, number>;
}

export interface AIEvaluation {
  winner: School | null;
  runnerUp: School | null;
  scoreGap: number;
  summary: string;
  strengthsWinner: string[];
  strengthsRunnerUp: string[];
  recommendation: string;
  hasEnoughData: boolean;
}

export function computeSchoolData(
  school: School,
  parameters: Parameter[],
  data: AnalysisData
): SchoolComparison {
  const grades = data.grades?.[school.id] ?? {};
  const paramGrades: Record<string, number> = {};
  let total = 0;
  let filledCount = 0;

  for (const param of parameters) {
    const g = grades[param.id];
    if (typeof g === 'number') {
      paramGrades[param.id] = g;
      total += g;
      filledCount++;
    } else {
      paramGrades[param.id] = 0;
    }
  }

  const maxPossible = parameters.length * 10;
  const average = filledCount > 0 ? total / filledCount : 0;

  const graded = parameters
    .map((p) => ({ param: p, grade: paramGrades[p.id] ?? 0 }))
    .filter((x) => x.grade > 0)
    .sort((a, b) => b.grade - a.grade);

  const topParams = graded.slice(0, 3);
  const weakParams = graded.slice(-3).reverse();

  return {
    school,
    total,
    maxPossible,
    average,
    filledCount,
    topParams,
    weakParams,
    paramGrades,
  };
}

export function generateAIEvaluation(
  comp1: SchoolComparison,
  comp2: SchoolComparison
): AIEvaluation {
  const minFilled = 5;
  const hasEnoughData = comp1.filledCount >= minFilled && comp2.filledCount >= minFilled;

  if (!hasEnoughData) {
    return {
      winner: null,
      runnerUp: null,
      scoreGap: 0,
      summary: 'Non ci sono ancora voti sufficienti per generare una valutazione. Compila almeno 5 parametri per ciascuna scuola per ottenere un\'analisi.',
      strengthsWinner: [],
      strengthsRunnerUp: [],
      recommendation: 'Torna alla matrice di valutazione e inserisci più voti per le due scuole.',
      hasEnoughData: false,
    };
  }

  const [winner, runnerUp] = comp1.total >= comp2.total ? [comp1, comp2] : [comp2, comp1];
  const scoreGap = Math.abs(comp1.total - comp2.total);
  const gapPercent = (scoreGap / winner.maxPossible) * 100;

  const strengthsWinner = winner.topParams.map((t) =>
    `"${t.param.title}" con voto ${t.grade}/10`
  );
  const strengthsRunnerUp = runnerUp.topParams.map((t) =>
    `"${t.param.title}" con voto ${t.grade}/10`
  );

  let summary: string;
  if (scoreGap === 0) {
    summary = `Le due scuole ottengono lo stesso punteggio totale di ${comp1.total} punti. Si tratta di un confronto molto equilibrato.`;
  } else if (gapPercent < 5) {
    summary = `La scuola "${winner.school.name}" supera "${runnerUp.school.name}" di soli ${scoreGap} punti (${winner.total} contro ${runnerUp.total}). Il confronto è molto equilibrato.`;
  } else if (gapPercent < 15) {
    summary = `La scuola "${winner.school.name}" ottiene un punteggio di ${winner.total} punti, superando "${runnerUp.school.name}" (${runnerUp.total} punti) di ${scoreGap} punti.`;
  } else {
    summary = `La scuola "${winner.school.name}" si distingue nettamente con ${winner.total} punti contro ${runnerUp.total} di "${runnerUp.school.name}", con uno scarto di ${scoreGap} punti.`;
  }

  let recommendation: string;
  if (scoreGap === 0) {
    recommendation = `Essendo i punteggi identici, la scelta dovrebbe basarsi sui fattori personali: la "sensazione a pelle", l'ambiente scolastico e gli aspetti pratici come il tragitto. Considera anche le note qualitative inserite per ciascun parametro.`;
  } else if (gapPercent < 5) {
    recommendation = `Lo scarto è minimo. Consigliamo di valutare attentamente i parametri in cui ciascuna scuola eccelle e di dare peso alle preferenze personali dello studente, soprattutto alla "sensazione a pelle" e alle "prospettive future".`;
  } else if (gapPercent < 15) {
    recommendation = `"${winner.school.name}" presenta un vantaggio coerente. Tuttavia, "${runnerUp.school.name}" potrebbe essere preferibile se eccelle nei parametri più importanti per lo studente (passione, prospettive future, tipo di studio). Esamina i punti di forza di ciascuna scuola qui sotto.`;
  } else {
    recommendation = `I dati indicano chiaramente "${winner.school.name}" come l'opzione più adatta. Il vantaggio è significativo e distribuito su più parametri. Si consiglia di approfondire eventuali punti deboli per prepararsi al meglio, ma l'orientamento è netto.`;
  }

  return {
    winner: winner.school,
    runnerUp: runnerUp.school,
    scoreGap,
    summary,
    strengthsWinner,
    strengthsRunnerUp,
    recommendation,
    hasEnoughData: true,
  };
}
