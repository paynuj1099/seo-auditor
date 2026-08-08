'use client';

import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AuditScores } from '@/types/audit';

interface RadarChartProps {
  scores: AuditScores;
}

export default function RadarChart({ scores }: RadarChartProps) {
  const data = [
    {
      category: 'SEO',
      score: scores.seo,
      fullMark: 100,
    },
    {
      category: 'Technical',
      score: scores.technical,
      fullMark: 100,
    },
    {
      category: 'Links',
      score: scores.links,
      fullMark: 100,
    },
    {
      category: 'Usability',
      score: scores.usability,
      fullMark: 100,
    },
    {
      category: 'Performance',
      score: scores.performance,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
